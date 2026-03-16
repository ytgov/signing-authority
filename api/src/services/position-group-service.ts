import { Knex } from "knex";
import { PositionGroup } from "../data/models";
import { GenericService } from "./generic-service";

/**
 * Specialized service for Position Groups that handles
 * the approval workflow steps and activated_positions snapshots.
 *
 * Uses unified workflow_steps table and position_group_snapshots tables.
 */
export class PositionGroupService extends GenericService<PositionGroup> {
  constructor(db: Knex) {
    super(db, "position_groups");
  }

  async getById(id: string | number): Promise<PositionGroup | null> {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(numId)) return null;

    const row = await this.db("position_groups")
      .leftJoin("departments", "position_groups.department_code", "departments.code")
      .where("position_groups.id", numId)
      .select("position_groups.*", "departments.description as department_descr")
      .first();
    if (!row) return null;

    return this.assembleGroup(row);
  }

  async getAll(query: any = {}, sort?: any): Promise<PositionGroup[]> {
    let q = this.db("position_groups")
      .leftJoin("departments", "position_groups.department_code", "departments.code")
      .select("position_groups.*", "departments.description as department_descr");
    q = this.applyGroupQuery(q, query);

    if (sort && typeof sort === "object") {
      for (const [col, dir] of Object.entries(sort)) {
        q = q.orderBy(col, (dir as number) === 1 ? "asc" : "desc");
      }
    }

    const rows = await q;
    if (rows.length === 0) return [];

    // Batch load workflow steps and snapshots
    const ids = rows.map((r: any) => r.id);

    const [allSteps, allSnapshots] = await Promise.all([
      this.db("workflow_steps").whereIn("position_group_id", ids),
      this.db("position_group_snapshots").whereIn("position_group_id", ids),
    ]);

    // If there are snapshots, load their lines too
    let allSnapshotLines: any[] = [];
    if (allSnapshots.length > 0) {
      const snapshotIds = allSnapshots.map((s: any) => s.id);
      allSnapshotLines = await this.db("position_group_snapshot_lines").whereIn("snapshot_id", snapshotIds);
    }

    const stepsByGroup = this.groupBy(allSteps, "position_group_id");
    const snapshotsByGroup = this.groupBy(allSnapshots, "position_group_id");
    const linesBySnapshot = this.groupBy(allSnapshotLines, "snapshot_id");

    return rows.map((row: any) =>
      this.buildGroupDto(
        row,
        stepsByGroup.get(row.id) || [],
        snapshotsByGroup.get(row.id) || [],
        linesBySnapshot
      )
    );
  }

  async create(item: any): Promise<any> {
    const row = this.flattenForDb(item);
    delete row._id;
    delete row.id;
    delete row.positions;
    delete row.authority_lines;
    delete row.create_date_display;

    const [inserted] = await this.db("position_groups").insert(row).returning("id");
    const newId = typeof inserted === "object" ? inserted.id : inserted;

    // Save workflow steps from approval fields
    await this.saveWorkflowSteps(newId, item);

    // Save activated_positions as snapshots
    await this.saveSnapshots(newId, item.activated_positions);

    return { insertedId: newId };
  }

  async update(id: string | number, item: any): Promise<PositionGroup | undefined> {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;

    const row = this.flattenForDb(item);
    delete row._id;
    delete row.id;
    delete row.positions;
    delete row.authority_lines;
    delete row.create_date_display;

    await this.db.transaction(async (trx) => {
      await trx("position_groups").where({ id: numId }).update(row);

      // Replace workflow steps
      await trx("workflow_steps").where({ position_group_id: numId }).del();
      await this.saveWorkflowStepsInTrx(trx, numId, item);

      // Replace snapshots
      // First delete snapshot lines (cascade should handle, but be explicit)
      const existingSnapshots = await trx("position_group_snapshots").where({ position_group_id: numId }).select("id");
      if (existingSnapshots.length > 0) {
        const snapIds = existingSnapshots.map((s: any) => s.id);
        await trx("position_group_snapshot_lines").whereIn("snapshot_id", snapIds).del();
      }
      await trx("position_group_snapshots").where({ position_group_id: numId }).del();

      if (item.activated_positions && item.activated_positions.length > 0) {
        for (const pos of item.activated_positions) {
          const [snapInserted] = await trx("position_group_snapshots").insert({
            position_group_id: numId,
            position_id: pos.id || pos._id,
            position_name: pos.position || "",
            program_branch: pos.program_branch || null,
            activity: pos.activity || null,
            position_group_order: pos.position_group_order || null,
            snapshot_date: new Date(),
          }).returning("id");
          const snapId = typeof snapInserted === "object" ? snapInserted.id : snapInserted;

          if (pos.authority_lines && pos.authority_lines.length > 0) {
            for (const line of pos.authority_lines) {
              await trx("position_group_snapshot_lines").insert({
                snapshot_id: snapId,
                coding: line.coding || "",
                coding_display: line.coding_display || null,
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
              });
            }
          }
        }
      }
    });

    return item as PositionGroup;
  }

  /**
   * Flatten PositionGroup for DB insert/update.
   * Only includes parent table columns — approval fields go to workflow_steps.
   */
  private flattenForDb(item: any): any {
    return {
      department_code: item.department_code,
      program: item.program || null,
      activity: item.activity || null,
      create_date: item.create_date,
      created_by: item.created_by || null,
      created_by_id: item.created_by_id || null,
      status: item.status,
      archive_date: item.archive_date || null,
    };
  }

  /** Save workflow steps from the approval fields on the PositionGroup DTO */
  private async saveWorkflowSteps(groupId: number, item: any): Promise<void> {
    await this.saveWorkflowStepsInTrx(this.db, groupId, item);
  }

  private async saveWorkflowStepsInTrx(trx: Knex | Knex.Transaction, groupId: number, item: any): Promise<void> {
    if (item.finance_review_complete) {
      await trx("workflow_steps").insert({
        position_group_id: groupId,
        step_type: "finance_review",
        outcome: "approved",
        user_id: item.finance_review_complete.id || null,
        user_name: item.finance_review_complete.name || null,
        note: item.finance_review_complete.comments || null,
        step_date: item.finance_review_complete.date,
      });
    }
    if (item.finance_review_reject) {
      await trx("workflow_steps").insert({
        position_group_id: groupId,
        step_type: "finance_review",
        outcome: "rejected",
        user_id: item.finance_review_reject.id || null,
        user_name: item.finance_review_reject.name || null,
        note: item.finance_review_reject.comments || null,
        step_date: item.finance_review_reject.date,
      });
    }
    if (item.finance_approval_complete) {
      await trx("workflow_steps").insert({
        position_group_id: groupId,
        step_type: "finance_approval",
        outcome: "approved",
        user_id: item.finance_approval_complete.id || null,
        user_name: item.finance_approval_complete.name || null,
        note: item.finance_approval_complete.comments || null,
        step_date: item.finance_approval_complete.date,
      });
    }
    if (item.finance_approval_reject) {
      await trx("workflow_steps").insert({
        position_group_id: groupId,
        step_type: "finance_approval",
        outcome: "rejected",
        user_id: item.finance_approval_reject.id || null,
        user_name: item.finance_approval_reject.name || null,
        note: item.finance_approval_reject.comments || null,
        step_date: item.finance_approval_reject.date,
      });
    }
    if (item.upload_signatures) {
      await trx("workflow_steps").insert({
        position_group_id: groupId,
        step_type: "upload_signatures",
        outcome: "approved",
        user_id: item.upload_signatures.id || null,
        user_name: item.upload_signatures.name || null,
        note: item.upload_signatures.comments || null,
        file_id: item.upload_signatures.file_id || null,
        step_date: item.upload_signatures.date,
      });
    }
  }

  /** Save activated_positions as snapshot rows */
  private async saveSnapshots(groupId: number, activatedPositions: any[]): Promise<void> {
    if (!activatedPositions || activatedPositions.length === 0) return;

    for (const pos of activatedPositions) {
      const [snapInserted] = await this.db("position_group_snapshots").insert({
        position_group_id: groupId,
        position_id: pos.id || pos._id,
        position_name: pos.position || "",
        program_branch: pos.program_branch || null,
        activity: pos.activity || null,
        position_group_order: pos.position_group_order || null,
        snapshot_date: new Date(),
      }).returning("id");
      const snapId = typeof snapInserted === "object" ? snapInserted.id : snapInserted;

      if (pos.authority_lines && pos.authority_lines.length > 0) {
        for (const line of pos.authority_lines) {
          await this.db("position_group_snapshot_lines").insert({
            snapshot_id: snapId,
            coding: line.coding || "",
            coding_display: line.coding_display || null,
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
          });
        }
      }
    }
  }

  private async assembleGroup(row: any): Promise<PositionGroup> {
    const id = row.id;

    const [steps, snapshots] = await Promise.all([
      this.db("workflow_steps").where({ position_group_id: id }),
      this.db("position_group_snapshots").where({ position_group_id: id }),
    ]);

    let snapshotLines: any[] = [];
    if (snapshots.length > 0) {
      const snapIds = snapshots.map((s: any) => s.id);
      snapshotLines = await this.db("position_group_snapshot_lines").whereIn("snapshot_id", snapIds);
    }
    const linesBySnapshot = this.groupBy(snapshotLines, "snapshot_id");

    return this.buildGroupDto(row, steps, snapshots, linesBySnapshot);
  }

  /**
   * Build the PositionGroup DTO, reconstructing the approval fields
   * from workflow_steps rows for backward compatibility.
   */
  private buildGroupDto(
    row: any,
    steps: any[],
    snapshots: any[],
    linesBySnapshot: Map<number, any[]>
  ): PositionGroup {
    // Reconstruct approval fields from workflow_steps
    const finReviewApproved = steps.find((s: any) => s.step_type === "finance_review" && s.outcome === "approved");
    const finReviewRejected = steps.find((s: any) => s.step_type === "finance_review" && s.outcome === "rejected");
    const finApprovalApproved = steps.find((s: any) => s.step_type === "finance_approval" && s.outcome === "approved");
    const finApprovalRejected = steps.find((s: any) => s.step_type === "finance_approval" && s.outcome === "rejected");
    const uploadSig = steps.find((s: any) => s.step_type === "upload_signatures");

    // Reconstruct activated_positions from snapshots
    const activated_positions = snapshots.map((snap: any) => {
      const lines = linesBySnapshot.get(snap.id) || [];
      return {
        id: snap.position_id,
        _id: snap.position_id,
        position: snap.position_name,
        program_branch: snap.program_branch,
        activity: snap.activity,
        position_group_order: snap.position_group_order,
        authority_lines: lines.map((l: any) => ({
          coding: l.coding,
          coding_display: l.coding_display,
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
      };
    });

    const stepToApproval = (step: any) =>
      step
        ? {
            id: step.user_id,
            name: step.user_name,
            comments: step.note,
            date: step.step_date,
          }
        : undefined;

    const group: any = {
      id: row.id,
      _id: row.id,
      department_code: row.department_code,
      department_descr: row.department_descr,
      program: row.program,
      activity: row.activity,
      create_date: row.create_date,
      created_by: row.created_by,
      created_by_id: row.created_by_id,
      status: row.status,
      archive_date: row.archive_date,

      finance_review_complete: stepToApproval(finReviewApproved),
      finance_review_reject: stepToApproval(finReviewRejected),
      finance_approval_complete: stepToApproval(finApprovalApproved),
      finance_approval_reject: stepToApproval(finApprovalRejected),

      upload_signatures: uploadSig
        ? {
            id: uploadSig.user_id,
            name: uploadSig.user_name,
            comments: uploadSig.note,
            date: uploadSig.step_date,
            file_id: uploadSig.file_id,
          }
        : undefined,

      activated_positions: activated_positions.length > 0 ? activated_positions : undefined,
    };

    return group as PositionGroup;
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

  private applyGroupQuery(q: Knex.QueryBuilder, query: any): Knex.QueryBuilder {
    if (!query || Object.keys(query).length === 0) return q;

    if (query.$and) {
      for (const condition of query.$and) {
        q = this.applyGroupQuery(q, condition);
      }
      return q;
    }

    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith("$")) continue;

      const column = key.includes(".") ? key : `position_groups.${key}`;

      if (typeof value === "object" && value !== null && !(value instanceof Date)) {
        const val = value as any;
        if (val.$nin) q = q.whereNotIn(column, val.$nin);
        else if (val.$in) q = q.whereIn(column, val.$in);
        else if (val.$ne) q = q.whereNot(column, val.$ne);
        else if (val.$exists === false) q = q.whereNull(column);
        else if (val.$exists === true) q = q.whereNotNull(column);
      } else {
        q = q.where(column, value as any);
      }
    }

    return q;
  }
}
