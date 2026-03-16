import { Knex } from "knex";
import { Authority } from "../data/models";
import { GenericService } from "./generic-service";

/**
 * Specialized service for Authorities (Form B) that handles
 * loading/saving the parent row plus all child tables.
 *
 * Uses unified tables: authority_lines, workflow_steps, audit_lines, authority_activations
 */
export class AuthorityService extends GenericService<Authority> {
  constructor(db: Knex) {
    super(db, "authorities");
  }

  async getById(id: string | number): Promise<Authority | null> {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(numId)) return null;

    const row = await this.db("authorities")
      .leftJoin("departments", "authorities.department_code", "departments.code")
      .leftJoin("employees as emp", "authorities.employee_id", "emp.id")
      .leftJoin("employees as sup", "authorities.supervisor_id", "sup.id")
      .where("authorities.id", numId)
      .select(
        "authorities.*",
        "departments.description as department_descr",
        "emp.email as emp_email",
        "emp.upn as emp_upn",
        "emp.ynet_id as emp_ynet_id",
        "sup.email as sup_email",
        "sup.upn as sup_upn",
        "sup.ynet_id as sup_ynet_id"
      )
      .first();
    if (!row) return null;

    return this.assembleAuthority(row);
  }

  async getAll(query: any = {}, sort?: any): Promise<Authority[]> {
    let q = this.db("authorities")
      .leftJoin("departments", "authorities.department_code", "departments.code")
      .leftJoin("employees as emp", "authorities.employee_id", "emp.id")
      .leftJoin("employees as sup", "authorities.supervisor_id", "sup.id")
      .select(
        "authorities.*",
        "departments.description as department_descr",
        "emp.email as emp_email",
        "emp.upn as emp_upn",
        "emp.ynet_id as emp_ynet_id",
        "sup.email as sup_email",
        "sup.upn as sup_upn",
        "sup.ynet_id as sup_ynet_id"
      );
    q = this.applyAuthorityQuery(q, query);

    if (sort && typeof sort === "object") {
      for (const [col, dir] of Object.entries(sort)) {
        q = q.orderBy(col, (dir as number) === 1 ? "asc" : "desc");
      }
    }

    const rows = await q;
    if (rows.length === 0) return [];

    // Batch load all child data
    const ids = rows.map((r: any) => r.id);

    const [allLines, allAudit, allActivations, allSteps] = await Promise.all([
      this.db("authority_lines").whereIn("authority_id", ids),
      this.db("audit_lines").whereIn("authority_id", ids),
      this.db("authority_activations").whereIn("authority_id", ids),
      this.db("workflow_steps").whereIn("authority_id", ids),
    ]);

    // Group by parent ID
    const linesByAuth = this.groupBy(allLines, "authority_id");
    const auditByAuth = this.groupBy(allAudit, "authority_id");
    const activationsByAuth = this.groupBy(allActivations, "authority_id");
    const stepsByAuth = this.groupBy(allSteps, "authority_id");

    return rows.map((row: any) =>
      this.assembleAuthorityFromBatch(row, linesByAuth, auditByAuth, activationsByAuth, stepsByAuth)
    );
  }

  async create(item: any): Promise<any> {
    const { authority_lines, audit_lines, activation, department_reviews, finance_reviews, upload_signatures, ...parentData } =
      this.flattenForDb(item);

    // Remove DTO-only fields
    delete parentData.form_a;
    delete parentData.department;
    delete parentData.created_by;
    delete parentData.status;
    delete parentData.issue_date_display;

    const [inserted] = await this.db("authorities").insert(parentData).returning("id");
    const newId = typeof inserted === "object" ? inserted.id : inserted;

    await this.saveChildRows(newId, authority_lines, audit_lines, activation, department_reviews, finance_reviews, upload_signatures);

    return { insertedId: newId };
  }

  async update(id: string | number, item: any): Promise<Authority | undefined> {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;

    const { authority_lines, audit_lines, activation, department_reviews, finance_reviews, upload_signatures, ...parentData } =
      this.flattenForDb(item);

    // Remove DTO-only fields
    delete parentData._id;
    delete parentData.id;
    delete parentData.form_a;
    delete parentData.department;
    delete parentData.created_by;
    delete parentData.status;
    delete parentData.issue_date_display;

    await this.db.transaction(async (trx) => {
      await trx("authorities").where({ id: numId }).update(parentData);

      // Replace authority lines
      await trx("authority_lines").where({ authority_id: numId }).del();
      if (authority_lines && authority_lines.length > 0) {
        const rows = authority_lines.map((l: any) => ({ ...l, authority_id: numId }));
        for (let i = 0; i < rows.length; i += 500) {
          await trx("authority_lines").insert(rows.slice(i, i + 500));
        }
      }

      // Replace audit lines
      await trx("audit_lines").where({ authority_id: numId }).del();
      if (audit_lines && audit_lines.length > 0) {
        const rows = audit_lines.map((a: any) => ({ ...a, authority_id: numId }));
        for (let i = 0; i < rows.length; i += 500) {
          await trx("audit_lines").insert(rows.slice(i, i + 500));
        }
      }

      // Replace activations
      await trx("authority_activations").where({ authority_id: numId }).del();
      if (activation && activation.length > 0) {
        for (const act of activation) {
          await trx("authority_activations").insert({ ...act, authority_id: numId });
        }
      }

      // Replace workflow steps (reviews + upload_signatures)
      await trx("workflow_steps").where({ authority_id: numId }).del();
      if (department_reviews && department_reviews.length > 0) {
        for (const r of department_reviews) {
          await trx("workflow_steps").insert({
            authority_id: numId,
            step_type: "department_review",
            outcome: r.result || "approved",
            user_id: r.user_id || null,
            user_name: r.name || null,
            note: r.note || null,
            step_date: r.date,
          });
        }
      }
      if (finance_reviews && finance_reviews.length > 0) {
        for (const r of finance_reviews) {
          await trx("workflow_steps").insert({
            authority_id: numId,
            step_type: "finance_review",
            outcome: r.result || "approved",
            user_id: r.user_id || null,
            user_name: r.name || null,
            note: r.note || null,
            step_date: r.date,
          });
        }
      }
      if (upload_signatures) {
        await trx("workflow_steps").insert({
          authority_id: numId,
          step_type: "upload_signatures",
          outcome: "approved",
          user_id: upload_signatures.id || null,
          user_name: upload_signatures.name || null,
          file_id: upload_signatures.file_id || null,
          step_date: upload_signatures.date || new Date(),
        });
      }
    });

    return item as Authority;
  }

  /**
   * Flatten the nested Authority object into DB columns + child arrays.
   * Employee/supervisor nested objects → flat columns + employee FK.
   */
  private flattenForDb(item: any) {
    const authority_lines = (item.authority_lines || []).map((line: any) => ({
      authority_id: 0, // will be set
      coding: line.coding,
      coding_display: line.coding_display || null,
      dept: line.dept || null,
      vote: line.vote || null,
      prog: line.prog || null,
      activity: line.activity || null,
      element: line.element || null,
      allotment: line.allotment || null,
      object: line.object || null,
      ledger1: line.ledger1 || null,
      ledger2: line.ledger2 || null,
      operational_restriction: line.operational_restriction || null,
      operational_restriction_id: line.operational_restriction_id || null,
      notes: line.notes || null,
      s24_procure_goods_limit: line.s24_procure_goods_limit?.toString() ?? null,
      s24_procure_services_limit: line.s24_procure_services_limit?.toString() ?? null,
      s24_procure_request_limit: line.s24_procure_request_limit?.toString() ?? null,
      s24_procure_assignment_limit: line.s24_procure_assignment_limit?.toString() ?? null,
      s23_procure_goods_limit: line.s23_procure_goods_limit?.toString() ?? null,
      s23_procure_services_limit: line.s23_procure_services_limit?.toString() ?? null,
      s24_transfer_limit: line.s24_transfer_limit?.toString() ?? null,
      s23_transfer_limit: line.s23_transfer_limit?.toString() ?? null,
      s24_travel_limit: line.s24_travel_limit?.toString() ?? null,
      other_limit: line.other_limit?.toString() ?? null,
      loans_limit: line.loans_limit?.toString() ?? null,
      s29_performance_limit: line.s29_performance_limit?.toString() ?? null,
      s30_payment_limit: line.s30_payment_limit?.toString() ?? null,
    }));

    const audit_lines = (item.audit_lines || []).map((a: any) => ({
      authority_id: 0,
      audit_date: a.date,
      user_name: a.user_name || null,
      action: a.action || null,
      previous_value: a.previous_value ? JSON.stringify(a.previous_value) : null,
    }));

    const activation = (item.activation || []).map((act: any) => ({
      authority_id: 0,
      effective_date: act.date || null,
      expire_date: act.expire_date || null,
      activate_reason: act.activate_reason || null,
      archive_reason: act.archive_reason || null,
      activate_user_id: act.activate_user_id || null,
      approve_user_email: act.approve_user_email || null,
      approve_user_date: act.approve_user_date || null,
      reject_user_date: act.reject_user_date || null,
      file_id: act.file?.id || act.file?._id || act.file_id || null,
      memo_id: act.memo?.id || act.memo?._id || act.memo_id || null,
    }));

    const parentData: any = {
      created_by_id: item.created_by_id || null,
      created_by_name: item.created_by_name || item.created_by || null,
      create_date: item.create_date || null,
      cancel_date: item.cancel_date || null,
      cancel_by_name: item.cancel_by_name || null,
      authority_type: item.authority_type || "substantive",
      form_a_id: item.form_a_id || null,
      department_code: item.department_code,
      program_branch: item.program_branch || null,
      reject_comments: item.reject_comments || null,
      // employee flattened (FK + audit-trail fields)
      employee_id: item.employee?.value?.id || item.employee?.value?._id || null,
      employee_name: item.employee?.name || null,
      employee_title: item.employee?.title || null,
      employee_signed_date: item.employee?.signed_date || null,
      // supervisor flattened
      supervisor_id: item.supervisor?.value?.id || item.supervisor?.value?._id || null,
      supervisor_name: item.supervisor?.name || null,
      supervisor_title: item.supervisor?.title || null,
      supervisor_signed_date: item.supervisor?.signed_date || null,
    };

    // Extract review/upload data for workflow_steps
    const department_reviews = item.department_reviews;
    const finance_reviews = item.finance_reviews;
    const upload_signatures = item.upload_signatures;

    // Carry through DTO-only fields for return
    parentData.form_a = item.form_a;
    parentData.department = item.department;
    parentData.created_by = item.created_by;
    parentData.status = item.status;
    parentData.issue_date_display = item.issue_date_display;

    return { authority_lines, audit_lines, activation, department_reviews, finance_reviews, upload_signatures, ...parentData };
  }

  private async saveChildRows(
    authorityId: number,
    authorityLines: any[],
    auditLines: any[],
    activations: any[],
    departmentReviews: any[],
    financeReviews: any[],
    uploadSignatures: any
  ): Promise<void> {
    if (authorityLines && authorityLines.length > 0) {
      const rows = authorityLines.map((l: any) => ({ ...l, authority_id: authorityId }));
      for (let i = 0; i < rows.length; i += 500) {
        await this.db("authority_lines").insert(rows.slice(i, i + 500));
      }
    }

    if (auditLines && auditLines.length > 0) {
      const rows = auditLines.map((a: any) => ({ ...a, authority_id: authorityId }));
      for (let i = 0; i < rows.length; i += 500) {
        await this.db("audit_lines").insert(rows.slice(i, i + 500));
      }
    }

    if (activations && activations.length > 0) {
      for (const act of activations) {
        await this.db("authority_activations").insert({ ...act, authority_id: authorityId });
      }
    }

    // Save workflow steps for reviews
    if (departmentReviews && departmentReviews.length > 0) {
      for (const r of departmentReviews) {
        await this.db("workflow_steps").insert({
          authority_id: authorityId,
          step_type: "department_review",
          outcome: r.result || "approved",
          user_id: r.user_id || null,
          user_name: r.name || null,
          note: r.note || null,
          step_date: r.date,
        });
      }
    }

    if (financeReviews && financeReviews.length > 0) {
      for (const r of financeReviews) {
        await this.db("workflow_steps").insert({
          authority_id: authorityId,
          step_type: "finance_review",
          outcome: r.result || "approved",
          user_id: r.user_id || null,
          user_name: r.name || null,
          note: r.note || null,
          step_date: r.date,
        });
      }
    }

    if (uploadSignatures) {
      await this.db("workflow_steps").insert({
        authority_id: authorityId,
        step_type: "upload_signatures",
        outcome: "approved",
        user_id: uploadSignatures.id || null,
        user_name: uploadSignatures.name || null,
        file_id: uploadSignatures.file_id || null,
        step_date: uploadSignatures.date || new Date(),
      });
    }
  }

  /**
   * Assemble a full Authority object from a DB row + child tables (single load)
   */
  private async assembleAuthority(row: any): Promise<Authority> {
    const id = row.id;

    const [authorityLines, auditLines, activations, steps] = await Promise.all([
      this.db("authority_lines").where({ authority_id: id }),
      this.db("audit_lines").where({ authority_id: id }),
      this.db("authority_activations").where({ authority_id: id }),
      this.db("workflow_steps").where({ authority_id: id }),
    ]);

    return this.buildAuthorityDto(row, authorityLines, auditLines, activations, steps);
  }

  /**
   * Assemble from pre-fetched batch data (used in getAll for N+1 fix)
   */
  private assembleAuthorityFromBatch(
    row: any,
    linesByAuth: Map<number, any[]>,
    auditByAuth: Map<number, any[]>,
    activationsByAuth: Map<number, any[]>,
    stepsByAuth: Map<number, any[]>
  ): Authority {
    return this.buildAuthorityDto(
      row,
      linesByAuth.get(row.id) || [],
      auditByAuth.get(row.id) || [],
      activationsByAuth.get(row.id) || [],
      stepsByAuth.get(row.id) || []
    );
  }

  /**
   * Build the Authority DTO from a row and child data.
   * Reconstructs nested objects for backward compatibility with routes/frontend.
   */
  private buildAuthorityDto(
    row: any,
    authorityLines: any[],
    auditLines: any[],
    activations: any[],
    steps: any[]
  ): Authority {
    // Reconstruct reviews and upload_signatures from workflow_steps
    const departmentSteps = steps.filter((s: any) => s.step_type === "department_review");
    const financeSteps = steps.filter((s: any) => s.step_type === "finance_review");
    const uploadStep = steps.find((s: any) => s.step_type === "upload_signatures");

    const authority: any = {
      id: row.id,
      _id: row.id,
      created_by_id: row.created_by_id,
      created_by_name: row.created_by_name,
      create_date: row.create_date,
      cancel_date: row.cancel_date,
      cancel_by_name: row.cancel_by_name,
      authority_type: row.authority_type || "substantive",
      form_a_id: row.form_a_id,
      department_code: row.department_code,
      department_descr: row.department_descr,
      program_branch: row.program_branch,
      reject_comments: row.reject_comments,

      // Reconstruct nested employee object
      // FK fields from join, audit-trail fields from authority row
      employee: {
        name: row.employee_name,
        title: row.employee_title,
        upn: row.emp_upn || "",
        email: row.emp_email || "",
        ynet_id: row.emp_ynet_id || "",
        signed_date: row.employee_signed_date,
      },

      // Reconstruct nested supervisor object
      supervisor: {
        name: row.supervisor_name,
        title: row.supervisor_title,
        upn: row.sup_upn || "",
        email: row.sup_email || "",
        ynet_id: row.sup_ynet_id || "",
        signed_date: row.supervisor_signed_date,
      },

      // Reconstruct upload_signatures from workflow_steps
      upload_signatures: uploadStep
        ? {
            id: uploadStep.user_id,
            name: uploadStep.user_name,
            date: uploadStep.step_date,
            file_id: uploadStep.file_id,
          }
        : undefined,

      // Reconstruct reviews from workflow_steps
      department_reviews: departmentSteps.length > 0
        ? departmentSteps.map((s: any) => ({
            date: s.step_date,
            name: s.user_name,
            user_id: s.user_id,
            result: s.outcome === "approved" ? "Approved" : "Rejected",
            note: s.note,
          }))
        : undefined,

      finance_reviews: financeSteps.length > 0
        ? financeSteps.map((s: any) => ({
            date: s.step_date,
            name: s.user_name,
            user_id: s.user_id,
            result: s.outcome === "approved" ? "Approved" : "Rejected",
            note: s.note,
          }))
        : undefined,

      authority_lines: authorityLines.map((l: any) => ({
        coding: l.coding,
        coding_display: l.coding_display,
        dept: l.dept,
        vote: l.vote,
        prog: l.prog,
        activity: l.activity,
        element: l.element,
        allotment: l.allotment,
        object: l.object,
        ledger1: l.ledger1,
        ledger2: l.ledger2,
        operational_restriction: l.operational_restriction,
        operational_restriction_id: l.operational_restriction_id,
        notes: l.notes,
        s24_procure_goods_limit: l.s24_procure_goods_limit,
        s24_procure_services_limit: l.s24_procure_services_limit,
        s24_procure_request_limit: l.s24_procure_request_limit,
        s24_procure_assignment_limit: l.s24_procure_assignment_limit,
        s23_procure_goods_limit: l.s23_procure_goods_limit,
        s23_procure_services_limit: l.s23_procure_services_limit,
        s24_transfer_limit: l.s24_transfer_limit,
        s23_transfer_limit: l.s23_transfer_limit,
        s24_travel_limit: l.s24_travel_limit,
        other_limit: l.other_limit,
        loans_limit: l.loans_limit,
        s29_performance_limit: l.s29_performance_limit,
        s30_payment_limit: l.s30_payment_limit,
      })),

      audit_lines: auditLines.map((a: any) => ({
        date: a.audit_date,
        user_name: a.user_name,
        action: a.action,
        previous_value: a.previous_value ? JSON.parse(a.previous_value) : {},
        date_display: a.date_display,
      })),

      activation:
        activations.length > 0
          ? activations.map((act: any) => ({
              id: act.id,
              date: act.effective_date,
              expire_date: act.expire_date,
              activate_reason: act.activate_reason,
              archive_reason: act.archive_reason,
              activate_user_id: act.activate_user_id,
              approve_user_email: act.approve_user_email,
              approve_user_date: act.approve_user_date,
              reject_user_date: act.reject_user_date,
              file_id: act.file_id,
              memo_id: act.memo_id,
            }))
          : undefined,
    };

    return authority as Authority;
  }

  /** Group an array of rows by a key field into a Map */
  private groupBy(rows: any[], key: string): Map<number, any[]> {
    const map = new Map<number, any[]>();
    for (const row of rows) {
      const id = row[key];
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(row);
    }
    return map;
  }

  /**
   * Apply MongoDB-style query patterns to a Knex query builder.
   * Translates the subset of MongoDB operators used in the codebase.
   */
  private applyAuthorityQuery(q: Knex.QueryBuilder, query: any): Knex.QueryBuilder {
    if (!query || Object.keys(query).length === 0) return q;

    // Handle $and at top level
    if (query.$and) {
      for (const condition of query.$and) {
        q = this.applyAuthorityQuery(q, condition);
      }
      return q;
    }

    // Handle $or at top level
    if (query.$or) {
      q = q.where((builder) => {
        for (const condition of query.$or) {
          builder.orWhere((subBuilder) => {
            this.applySimpleCondition(subBuilder, condition);
          });
        }
      });
      return q;
    }

    // Handle individual field conditions
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith("$")) continue;
      q = this.applyFieldCondition(q, key, value);
    }

    return q;
  }

  private applySimpleCondition(builder: Knex.QueryBuilder, condition: any): void {
    for (const [key, value] of Object.entries(condition)) {
      this.applyFieldCondition(builder, key, value);
    }
  }

  private applyFieldCondition(q: Knex.QueryBuilder, key: string, value: any): Knex.QueryBuilder {
    // Map dot-notation MongoDB fields to new column names
    // employee email/upn/ynet_id now come from joined employees table
    const columnMap: Record<string, string> = {
      "employee.name": "authorities.employee_name",
      "employee.email": "emp.email",
      "employee.ynet_id": "emp.ynet_id",
      "employee.title": "authorities.employee_title",
      "supervisor.email": "sup.email",
    };
    const column = columnMap[key] || (key.includes(".") ? key : `authorities.${key}`);

    if (value === null || value === undefined) {
      return q.whereNull(column);
    }

    // Handle MongoDB operators
    if (typeof value === "object" && value !== null && !(value instanceof Date)) {
      if (value.$regex) {
        const pattern = value.$regex instanceof RegExp ? value.$regex.source : value.$regex;
        return q.where(column, "LIKE", `%${pattern}%`);
      }
      if (value.$exists === false) {
        return q.whereNull(column);
      }
      if (value.$exists === true) {
        return q.whereNotNull(column);
      }
      if (value.$nin) {
        return q.whereNotIn(column, value.$nin);
      }
      if (value.$in) {
        return q.whereIn(column, value.$in);
      }
      if (value.$ne) {
        return q.whereNot(column, value.$ne);
      }
      if (value.$eq !== undefined) {
        if (value.$eq === null) return q.whereNull(column);
        return q.where(column, value.$eq);
      }
      if (value.$lte) {
        return q.where(column, "<=", value.$lte);
      }
      if (value.$elemMatch) {
        // For activation array queries - use subquery on authority_activations
        if (key === "activation") {
          return q.whereExists(
            this.db("authority_activations")
              .whereRaw("authority_activations.authority_id = authorities.id")
              .where((sub) => {
                for (const [k, v] of Object.entries(value.$elemMatch)) {
                  // Map 'date' to 'effective_date' for activation queries
                  const actCol = k === "date" ? "effective_date" : k;
                  if (v === null) sub.whereNull(actCol);
                  else sub.where(actCol, v as any);
                }
              })
              .select(this.db.raw("1"))
          );
        }
      }
    }

    // Special handling for 'activation' field with $exists
    if (key === "activation" && typeof value === "object") {
      if (value.$exists === false) {
        return q.whereNotExists(
          this.db("authority_activations")
            .whereRaw("authority_activations.authority_id = authorities.id")
            .select(this.db.raw("1"))
        );
      }
      if (value.$exists === true) {
        return q.whereExists(
          this.db("authority_activations")
            .whereRaw("authority_activations.authority_id = authorities.id")
            .select(this.db.raw("1"))
        );
      }
    }

    // Simple equality
    return q.where(column, value);
  }
}
