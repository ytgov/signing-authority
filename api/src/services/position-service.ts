import { Knex } from "knex";
import { Position } from "../data/models";
import { GenericService } from "./generic-service";

/**
 * Specialized service for Positions (Form A) that handles
 * loading/saving the parent row plus all child tables.
 *
 * Uses unified tables: authority_lines, workflow_steps, audit_lines
 */
export class PositionService extends GenericService<Position> {
  constructor(db: Knex) {
    super(db, "positions");
  }

  async getById(id: string | number): Promise<Position | null> {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(numId)) return null;

    const row = await this.db("positions")
      .leftJoin("departments", "positions.department_code", "departments.code")
      .where("positions.id", numId)
      .select("positions.*", "departments.description as department_descr")
      .first();
    if (!row) return null;

    return this.assemblePosition(row);
  }

  async getAll(query: any = {}, sort?: any): Promise<Position[]> {
    let q = this.db("positions")
      .leftJoin("departments", "positions.department_code", "departments.code")
      .select("positions.*", "departments.description as department_descr");
    q = this.applyPositionQuery(q, query);

    if (sort && typeof sort === "object") {
      for (const [col, dir] of Object.entries(sort)) {
        q = q.orderBy(col, (dir as number) === 1 ? "asc" : "desc");
      }
    }

    const rows = await q;
    if (rows.length === 0) return [];

    // Batch load all child data
    const ids = rows.map((r: any) => r.id);

    const [allLines, allAudit, allSteps] = await Promise.all([
      this.db("authority_lines").whereIn("position_id", ids),
      this.db("audit_lines").whereIn("position_id", ids),
      this.db("workflow_steps").whereIn("position_id", ids),
    ]);

    const linesByPos = this.groupBy(allLines, "position_id");
    const auditByPos = this.groupBy(allAudit, "position_id");
    const stepsByPos = this.groupBy(allSteps, "position_id");

    return rows.map((row: any) =>
      this.buildPositionDto(
        row,
        linesByPos.get(row.id) || [],
        auditByPos.get(row.id) || [],
        stepsByPos.get(row.id) || []
      )
    );
  }

  async create(item: any): Promise<any> {
    const { authority_lines, audit_lines, department_reviews, finance_reviews, ...rest } =
      this.flattenForDb(item);

    // Remove DTO-only fields
    delete rest.program_activity;
    delete rest.status;
    delete rest.department;
    delete rest.active_authorities;
    delete rest.issue_date_display;
    delete rest._id;
    delete rest.id;

    const [inserted] = await this.db("positions").insert(rest).returning("id");
    const newId = typeof inserted === "object" ? inserted.id : inserted;

    await this.saveChildRows(newId, authority_lines, audit_lines, department_reviews, finance_reviews);

    return { insertedId: newId };
  }

  async update(id: string | number, item: any): Promise<Position | undefined> {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;

    const { authority_lines, audit_lines, department_reviews, finance_reviews, ...rest } =
      this.flattenForDb(item);

    // Remove DTO-only fields
    delete rest._id;
    delete rest.id;
    delete rest.program_activity;
    delete rest.status;
    delete rest.department;
    delete rest.active_authorities;
    delete rest.issue_date_display;

    await this.db.transaction(async (trx) => {
      await trx("positions").where({ id: numId }).update(rest);

      // Replace authority lines (unified table, filter by position_id)
      await trx("authority_lines").where({ position_id: numId }).del();
      if (authority_lines && authority_lines.length > 0) {
        const rows = authority_lines.map((l: any) => ({ ...l, position_id: numId }));
        for (let i = 0; i < rows.length; i += 500) {
          await trx("authority_lines").insert(rows.slice(i, i + 500));
        }
      }

      // Replace audit lines (unified table)
      await trx("audit_lines").where({ position_id: numId }).del();
      if (audit_lines && audit_lines.length > 0) {
        const rows = audit_lines.map((a: any) => ({ ...a, position_id: numId }));
        for (let i = 0; i < rows.length; i += 500) {
          await trx("audit_lines").insert(rows.slice(i, i + 500));
        }
      }

      // Replace workflow steps (reviews)
      await trx("workflow_steps").where({ position_id: numId }).del();
      if (department_reviews && department_reviews.length > 0) {
        for (const r of department_reviews) {
          await trx("workflow_steps").insert({
            position_id: numId,
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
            position_id: numId,
            step_type: "finance_review",
            outcome: r.result || "approved",
            user_id: r.user_id || null,
            user_name: r.name || null,
            note: r.note || null,
            step_date: r.date,
          });
        }
      }
    });

    return item as Position;
  }

  async aggregate(pipeline?: any[]): Promise<any[]> {
    // Handle the one aggregation query in form-a-router.ts for department count
    if (pipeline && pipeline.length >= 3) {
      const matchStage = pipeline.find((s) => s.$match);
      const department_code = matchStage?.$match?.department_code;

      if (department_code) {
        const result = await this.db("positions")
          .join("authority_lines", "positions.id", "authority_lines.position_id")
          .leftJoin("departments", "positions.department_code", "departments.code")
          .where("positions.department_code", department_code)
          .select("positions.department_code", "departments.description as department_descr")
          .count("* as position_count")
          .groupBy("positions.department_code", "departments.description");

        return result.map((r: any) => ({
          _id: {
            department_code: r.department_code,
            department_descr: r.department_descr,
          },
          position_count: r.position_count,
        }));
      }
    }

    return [];
  }

  private flattenForDb(item: any) {
    const authority_lines = (item.authority_lines || []).map((line: any) => ({
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
      contracts_for_goods_services: line.contracts_for_goods_services?.toString() ?? null,
      loans_and_guarantees: line.loans_and_guarantees?.toString() ?? null,
      transfer_payments: line.transfer_payments?.toString() ?? null,
      authorization_for_travel: line.authorization_for_travel?.toString() ?? null,
      request_for_goods_services: line.request_for_goods_services?.toString() ?? null,
      assignment_authority: line.assignment_authority?.toString() ?? null,
      s29_performance_limit: line.s29_performance_limit?.toString() ?? null,
      s30_payment_limit: line.s30_payment_limit?.toString() ?? null,
    }));

    const audit_lines = (item.audit_lines || []).map((a: any) => ({
      audit_date: a.date,
      user_name: a.user_name || null,
      action: a.action || null,
      previous_value: a.previous_value ? JSON.stringify(a.previous_value) : null,
    }));

    const department_reviews = (item.department_reviews || []).map((r: any) => ({
      date: r.date,
      name: r.name || null,
      user_id: r.user_id || null,
      result: r.result,
      note: r.note || null,
    }));

    const finance_reviews = (item.finance_reviews || []).map((r: any) => ({
      date: r.date,
      name: r.name || null,
      user_id: r.user_id || null,
      result: r.result,
      note: r.note || null,
    }));

    const parentData: any = {
      department_code: item.department_code,
      program_branch: item.program_branch || null,
      activity: item.activity || null,
      position: item.position,
      is_deputy_minister: item.is_deputy_minister ? 1 : 0,
      is_deputy_duplicate: item.is_deputy_duplicate ? 1 : 0,
      position_group_id: item.position_group_id === "-1" ? null : (item.position_group_id || null),
      position_group_order: item.position_group_order || null,
      // activation (single object)
      activation_date: item.activation?.date || null,
      activation_user_id: item.activation?.activate_user_id || null,
      activation_file_id: item.activation?.file_id || null,
      // deactivation (single object)
      deactivation_date: item.deactivation?.date || null,
      deactivation_reason: item.deactivation?.reason || null,
      deactivation_by: item.deactivation?.by || null,
      deactivation_sub: item.deactivation?.sub || null,
    };

    // Carry through DTO-only fields
    parentData.program_activity = item.program_activity;
    parentData.status = item.status;
    parentData.department = item.department;
    parentData.active_authorities = item.active_authorities;
    parentData.issue_date_display = item.issue_date_display;

    return { authority_lines, audit_lines, department_reviews, finance_reviews, ...parentData };
  }

  private async saveChildRows(
    positionId: number,
    authorityLines: any[],
    auditLines: any[],
    departmentReviews: any[],
    financeReviews: any[]
  ): Promise<void> {
    if (authorityLines && authorityLines.length > 0) {
      const rows = authorityLines.map((l: any) => ({ ...l, position_id: positionId }));
      for (let i = 0; i < rows.length; i += 500) {
        await this.db("authority_lines").insert(rows.slice(i, i + 500));
      }
    }

    if (auditLines && auditLines.length > 0) {
      const rows = auditLines.map((a: any) => ({ ...a, position_id: positionId }));
      for (let i = 0; i < rows.length; i += 500) {
        await this.db("audit_lines").insert(rows.slice(i, i + 500));
      }
    }

    if (departmentReviews && departmentReviews.length > 0) {
      for (const r of departmentReviews) {
        await this.db("workflow_steps").insert({
          position_id: positionId,
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
          position_id: positionId,
          step_type: "finance_review",
          outcome: r.result || "approved",
          user_id: r.user_id || null,
          user_name: r.name || null,
          note: r.note || null,
          step_date: r.date,
        });
      }
    }
  }

  private async assemblePosition(row: any): Promise<Position> {
    const id = row.id;

    const [authorityLines, auditLines, steps] = await Promise.all([
      this.db("authority_lines").where({ position_id: id }),
      this.db("audit_lines").where({ position_id: id }),
      this.db("workflow_steps").where({ position_id: id }),
    ]);

    return this.buildPositionDto(row, authorityLines, auditLines, steps);
  }

  private buildPositionDto(row: any, authorityLines: any[], auditLines: any[], steps: any[]): Position {
    const departmentSteps = steps.filter((s: any) => s.step_type === "department_review");
    const financeSteps = steps.filter((s: any) => s.step_type === "finance_review");

    const position: any = {
      id: row.id,
      _id: row.id,
      department_code: row.department_code,
      department_descr: row.department_descr,
      program_branch: row.program_branch,
      activity: row.activity,
      position: row.position,
      is_deputy_minister: !!row.is_deputy_minister,
      is_deputy_duplicate: !!row.is_deputy_duplicate,
      position_group_id: row.position_group_id,
      position_group_order: row.position_group_order,

      activation: row.activation_date
        ? {
            date: row.activation_date,
            activate_user_id: row.activation_user_id,
            file_id: row.activation_file_id,
          }
        : undefined,

      deactivation: row.deactivation_date
        ? {
            date: row.deactivation_date,
            reason: row.deactivation_reason,
            by: row.deactivation_by,
            sub: row.deactivation_sub,
          }
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
        contracts_for_goods_services: l.contracts_for_goods_services,
        loans_and_guarantees: l.loans_and_guarantees,
        transfer_payments: l.transfer_payments,
        authorization_for_travel: l.authorization_for_travel,
        request_for_goods_services: l.request_for_goods_services,
        assignment_authority: l.assignment_authority,
        s29_performance_limit: l.s29_performance_limit,
        s30_payment_limit: l.s30_payment_limit,
      })),

      audit_lines: auditLines.map((a: any) => ({
        date: a.audit_date,
        user_name: a.user_name,
        action: a.action,
        previous_value: a.previous_value ? JSON.parse(a.previous_value) : {},
      })),

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
    };

    return position as Position;
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

  // Maps MongoDB-style nested object field names to their flattened SQL column equivalents
  private static readonly COLUMN_MAP: Record<string, string> = {
    deactivation: "positions.deactivation_date",
    activation: "positions.activation_date",
  };

  private applyPositionQuery(q: Knex.QueryBuilder, query: any): Knex.QueryBuilder {
    if (!query || Object.keys(query).length === 0) return q;

    for (const [rawKey, value] of Object.entries(query)) {
      const key = PositionService.COLUMN_MAP[rawKey] || (rawKey.includes(".") ? rawKey : `positions.${rawKey}`);
      if (typeof value === "object" && value !== null && !(value instanceof Date)) {
        const val = value as any;
        if (val.$ne !== undefined) {
          if (val.$ne === null) q = q.whereNotNull(key);
          else q = q.whereNot(key, val.$ne);
        } else if (val.$eq !== undefined) {
          if (val.$eq === null) q = q.whereNull(key);
          else q = q.where(key, val.$eq);
        } else if (val.$in) {
          q = q.whereIn(key, val.$in);
        } else if (val.$nin) {
          q = q.whereNotIn(key, val.$nin);
        } else if (val.$exists === false) {
          q = q.whereNull(key);
        } else if (val.$exists === true) {
          q = q.whereNotNull(key);
        }
      } else if (typeof value === "boolean") {
        q = q.where(key, value ? 1 : 0);
      } else {
        q = q.where(key, value as any);
      }
    }

    return q;
  }
}
