/**
 * MongoDB to MSSQL Migration Script (Normalized)
 *
 * Reads all data from MongoDB and inserts directly into the
 * normalized MSSQL schema. No intermediate denormalized step.
 *
 * Uses schema.sql for DDL, then inserts data writing directly to:
 *   - Unified authority_lines (Form A + Form B lines in one table)
 *   - Unified workflow_steps (all approval steps across forms)
 *   - Unified audit_lines (all audit entries)
 *   - position_group_snapshots + snapshot_lines (replacing JSON blobs)
 *   - departments lookup table (extracted from data)
 *   - employee_id / supervisor_id FKs on authorities
 *
 * Usage: npx tsx src/migration/migrate.ts
 */

import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import knex, { Knex } from "knex";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

// MongoDB config
const MONGO_URL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}`;
const MONGO_DB = process.env.MONGO_DB || "authorities";

// MSSQL config
const MSSQL_HOST = process.env.MSSQL_HOST || "localhost";
const MSSQL_USER = process.env.MSSQL_USER || "";
const MSSQL_PASSWORD = process.env.MSSQL_PASSWORD || "";
const MSSQL_DB = process.env.MSSQL_DB || "signing_authority";
const MSSQL_PORT = parseInt(process.env.MSSQL_PORT || "1433");

// ID maps: old mongo hex string -> new SQL int id
const userIdMap = new Map<string, number>();
const fileIdMap = new Map<string, number>();
const employeeIdMap = new Map<string, number>();
const opRestrictionIdMap = new Map<string, number>();
const positionGroupIdMap = new Map<string, number>();
const positionIdMap = new Map<string, number>();
const authorityIdMap = new Map<string, number>();

// Department set: collected during migration, inserted at the end
const departmentMap = new Map<string, string>(); // code -> description

// Deferred snapshots: position group snapshots reference positions,
// so we buffer them during position group migration and insert after positions exist
const deferredSnapshots: Array<{ groupId: number; pos: any }> = [];

function resolveId(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof ObjectId) return value.toHexString();
  if (value.toString) return value.toString();
  return null;
}

function lookupId(map: Map<string, number>, value: any): number | null {
  const key = resolveId(value);
  if (!key) return null;
  return map.get(key) ?? null;
}

async function batchInsert(db: Knex, table: string, rows: any[], batchSize = 500): Promise<void> {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await db(table).insert(batch);
  }
}

function trackDepartment(code: string | null | undefined, descr: string | null | undefined) {
  if (code && !departmentMap.has(code)) {
    departmentMap.set(code, descr || "");
  }
}

async function runSchema(db: Knex): Promise<void> {
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  const cleaned = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleaned
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await db.transaction(async (trx) => {
        await trx.raw(stmt);
      });
    } catch (err: any) {
      if (err.message?.includes("Cannot drop") || err.message?.includes("does not exist")) continue;
      console.error(`Error executing: ${stmt.substring(0, 100)}...`);
      throw err;
    }
  }

  console.log("Schema created successfully");
}

// =====================================================================
// Pre-scan: collect all department codes before inserting any data
// (departments table must be populated before FK-dependent inserts)
// =====================================================================

async function prescanDepartments(mongoDB: any): Promise<void> {
  console.log("Pre-scanning department codes...");

  const groups = await mongoDB.collection("PositionGroups").find({}, { projection: { department_code: 1, department_descr: 1 } }).toArray();
  for (const g of groups) trackDepartment(g.department_code, g.department_descr);

  const positions = await mongoDB.collection("FormA").find({}, { projection: { department_code: 1, department_descr: 1 } }).toArray();
  for (const p of positions) trackDepartment(p.department_code, p.department_descr);

  const authorities = await mongoDB.collection("Authorities").find({}, { projection: { department_code: 1, department_descr: 1 } }).toArray();
  for (const a of authorities) trackDepartment(a.department_code, a.department_descr);

  // Users can reference departments via department_admin_for
  const users = await mongoDB.collection("Users").find({}, { projection: { department_admin_for: 1 } }).toArray();
  for (const u of users) {
    let depts = u.department_admin_for || [];
    if (!Array.isArray(depts)) depts = [depts];
    for (const dept of depts) {
      if (dept) trackDepartment(dept, null);
    }
  }

  // Employees reference departments via primary_department
  const employees = await mongoDB.collection("Employees").find({}, { projection: { primary_department: 1 } }).toArray();
  for (const e of employees) {
    if (e.primary_department) trackDepartment(e.primary_department, null);
  }

  console.log(`  Found ${departmentMap.size} distinct departments`);
}

async function insertDepartments(sqlDb: Knex): Promise<void> {
  console.log("Inserting departments...");
  for (const [code, description] of departmentMap) {
    await sqlDb("departments").insert({ code, description, display_name: description });
  }
  console.log(`  Inserted ${departmentMap.size} departments`);
}

// =====================================================================
// Users
// =====================================================================

async function migrateUsers(mongoDB: any, sqlDb: Knex): Promise<void> {
  console.log("Migrating Users...");
  const users = await mongoDB.collection("Users").find({}).toArray();

  for (const user of users) {
    const mongoId = resolveId(user._id);

    const [inserted] = await sqlDb("users")
      .insert({
        email: user.email,
        sub: user.sub || null,
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status || null,
        display_name: user.display_name || null,
        create_date: user.create_date || null,
      })
      .returning("id");

    const newId = typeof inserted === "object" ? inserted.id : inserted;
    if (mongoId) userIdMap.set(mongoId, newId);

    // Roles → user_roles
    let roles = user.roles || [];
    if (!Array.isArray(roles)) roles = [roles];
    for (const role of roles) {
      if (role) await sqlDb("user_roles").insert({ user_id: newId, role });
    }

    // department_admin_for → user_department_admins
    let depts = user.department_admin_for || [];
    if (!Array.isArray(depts)) depts = [depts];
    for (const dept of depts) {
      if (dept) {
        trackDepartment(dept, null);
        await sqlDb("user_department_admins").insert({ user_id: newId, department_code: dept });
      }
    }
  }

  console.log(`  Migrated ${users.length} users`);
}

// =====================================================================
// Files (GridFS → stored_files)
// =====================================================================

async function migrateFiles(mongoDB: any, sqlDb: Knex): Promise<void> {
  console.log("Migrating Files (GridFS)...");
  const bucket = new GridFSBucket(mongoDB, { bucketName: "SAA-FILES" });

  let fileCount = 0;
  const cursor = bucket.find({});

  for await (const doc of cursor) {
    const mongoId = resolveId(doc._id);

    const chunks: Buffer[] = [];
    const stream = bucket.openDownloadStream(doc._id);

    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => resolve());
      stream.on("error", reject);
    });

    const content = Buffer.concat(chunks as Uint8Array[]);

    const [inserted] = await sqlDb("stored_files")
      .insert({
        filename: doc.filename,
        file_size: doc.length,
        mime_type: doc.metadata?.mimeType || "application/octet-stream",
        content,
        uploaded_by: doc.metadata?.uploadedBy || null,
        upload_date: doc.uploadDate || null,
      })
      .returning("id");

    const newId = typeof inserted === "object" ? inserted.id : inserted;
    if (mongoId) fileIdMap.set(mongoId, newId);
    fileCount++;
  }

  console.log(`  Migrated ${fileCount} files`);
}

// =====================================================================
// Employees
// =====================================================================

async function migrateEmployees(mongoDB: any, sqlDb: Knex): Promise<void> {
  console.log("Migrating Employees...");
  const employees = await mongoDB.collection("Employees").find({}).toArray();

  for (const emp of employees) {
    const mongoId = resolveId(emp._id);

    const [inserted] = await sqlDb("employees")
      .insert({
        employee_id: emp.employee_id || null,
        first_name: emp.first_name,
        last_name: emp.last_name,
        ynet_id: emp.ynet_id || null,
        email: emp.email || null,
        primary_department: emp.primary_department || null,
        created_by: emp.created_by || null,
        created_date: emp.created_date || null,
      })
      .returning("id");

    const newId = typeof inserted === "object" ? inserted.id : inserted;
    if (mongoId) employeeIdMap.set(mongoId, newId);
  }

  console.log(`  Migrated ${employees.length} employees`);
}

// =====================================================================
// Operational Restrictions
// =====================================================================

async function migrateOperationalRestrictions(mongoDB: any, sqlDb: Knex): Promise<void> {
  console.log("Migrating Operational Restrictions...");
  const items = await mongoDB.collection("OperationalRestrictions").find({}).toArray();

  for (const item of items) {
    const mongoId = resolveId(item._id);

    const [inserted] = await sqlDb("operational_restrictions")
      .insert({
        description: item.description ?? "",
        is_active: item.is_active ? 1 : 0,
        sort: item.sort ?? 0,
      })
      .returning("id");

    const newId = typeof inserted === "object" ? inserted.id : inserted;
    if (mongoId) opRestrictionIdMap.set(mongoId, newId);
  }

  console.log(`  Migrated ${items.length} operational restrictions`);
}

// =====================================================================
// Position Groups → normalized: workflow_steps + snapshots
// =====================================================================

async function migratePositionGroups(mongoDB: any, sqlDb: Knex): Promise<void> {
  console.log("Migrating Position Groups...");
  const groups = await mongoDB.collection("PositionGroups").find({}).toArray();

  for (const group of groups) {
    const mongoId = resolveId(group._id);

    // Insert parent row (slim — no flattened approval columns)
    const [inserted] = await sqlDb("position_groups")
      .insert({
        department_code: group.department_code,
        program: group.program || null,
        activity: group.activity || null,
        create_date: group.create_date,
        created_by: group.created_by || null,
        created_by_id: lookupId(userIdMap, group.created_by_id),
        status: group.status,
        archive_date: group.archive_date || null,
      })
      .returning("id");

    const newId = typeof inserted === "object" ? inserted.id : inserted;
    if (mongoId) positionGroupIdMap.set(mongoId, newId);

    // Approval fields → workflow_steps
    if (group.finance_review_complete) {
      await sqlDb("workflow_steps").insert({
        position_group_id: newId,
        step_type: "finance_review",
        outcome: "approved",
        user_id: lookupId(userIdMap, group.finance_review_complete.id),
        user_name: group.finance_review_complete.name || null,
        note: group.finance_review_complete.comments || null,
        step_date: group.finance_review_complete.date,
      });
    }
    if (group.finance_review_reject) {
      await sqlDb("workflow_steps").insert({
        position_group_id: newId,
        step_type: "finance_review",
        outcome: "rejected",
        user_id: lookupId(userIdMap, group.finance_review_reject.id),
        user_name: group.finance_review_reject.name || null,
        note: group.finance_review_reject.comments || null,
        step_date: group.finance_review_reject.date,
      });
    }
    if (group.finance_approval_complete) {
      await sqlDb("workflow_steps").insert({
        position_group_id: newId,
        step_type: "finance_approval",
        outcome: "approved",
        user_id: lookupId(userIdMap, group.finance_approval_complete.id),
        user_name: group.finance_approval_complete.name || null,
        note: group.finance_approval_complete.comments || null,
        step_date: group.finance_approval_complete.date,
      });
    }
    if (group.finance_approval_reject) {
      await sqlDb("workflow_steps").insert({
        position_group_id: newId,
        step_type: "finance_approval",
        outcome: "rejected",
        user_id: lookupId(userIdMap, group.finance_approval_reject.id),
        user_name: group.finance_approval_reject.name || null,
        note: group.finance_approval_reject.comments || null,
        step_date: group.finance_approval_reject.date,
      });
    }
    if (group.upload_signatures) {
      await sqlDb("workflow_steps").insert({
        position_group_id: newId,
        step_type: "upload_signatures",
        outcome: "approved",
        user_id: lookupId(userIdMap, group.upload_signatures.id),
        user_name: group.upload_signatures.name || null,
        note: group.upload_signatures.comments || null,
        file_id: lookupId(fileIdMap, group.upload_signatures.file_id),
        step_date: group.upload_signatures.date,
      });
    }

    // Buffer activated_positions for deferred insert (positions don't exist yet)
    if (group.activated_positions && group.activated_positions.length > 0) {
      for (const pos of group.activated_positions) {
        deferredSnapshots.push({ groupId: newId, pos });
      }
    }
  }

  console.log(`  Migrated ${groups.length} position groups`);
}

// =====================================================================
// Position Group Snapshots (deferred — positions must exist first)
// =====================================================================

async function migratePositionGroupSnapshots(sqlDb: Knex): Promise<void> {
  console.log("Inserting deferred position group snapshots...");
  let count = 0;

  for (const { groupId, pos } of deferredSnapshots) {
    const posId = lookupId(positionIdMap, pos._id || pos.id);

    const [snapInserted] = await sqlDb("position_group_snapshots").insert({
      position_group_id: groupId,
      position_id: posId || 0,
      position_name: pos.position || "",
      program_branch: pos.program_branch || null,
      activity: pos.activity || null,
      position_group_order: pos.position_group_order || null,
      snapshot_date: new Date(),
    }).returning("id");
    const snapId = typeof snapInserted === "object" ? snapInserted.id : snapInserted;

    if (pos.authority_lines && pos.authority_lines.length > 0) {
      for (const line of pos.authority_lines) {
        await sqlDb("position_group_snapshot_lines").insert({
          snapshot_id: snapId,
          coding: line.coding || "",
          coding_display: line.coding_display || null,
          operational_restriction: line.operational_restriction || null,
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
    count++;
  }

  console.log(`  Inserted ${count} position group snapshots`);
}

// =====================================================================
// Positions (Form A) → unified authority_lines, workflow_steps, audit_lines
// =====================================================================

async function migratePositions(mongoDB: any, sqlDb: Knex): Promise<void> {
  console.log("Migrating Positions (Form A)...");
  const positions = await mongoDB.collection("FormA").find({}).toArray();

  for (const pos of positions) {
    const mongoId = resolveId(pos._id);

    let pgId: number | null = null;
    if (pos.position_group_id && pos.position_group_id !== "-1") {
      pgId = lookupId(positionGroupIdMap, pos.position_group_id);
    }

    const [inserted] = await sqlDb("positions")
      .insert({
        department_code: pos.department_code,
        program_branch: pos.program_branch || null,
        activity: pos.activity || null,
        position: pos.position,
        is_deputy_minister: pos.is_deputy_minister ? 1 : 0,
        is_deputy_duplicate: pos.is_deputy_duplicate ? 1 : 0,
        position_group_id: pgId,
        position_group_order: pos.position_group_order || null,
        activation_date: pos.activation?.date || null,
        activation_user_id: pos.activation ? lookupId(userIdMap, pos.activation.activate_user_id) : null,
        activation_file_id: pos.activation ? lookupId(fileIdMap, pos.activation.file_id) : null,
        deactivation_date: pos.deactivation?.date || null,
        deactivation_reason: pos.deactivation?.reason || null,
        deactivation_by: pos.deactivation?.by || null,
        deactivation_sub: pos.deactivation?.sub || null,
      })
      .returning("id");

    const newId = typeof inserted === "object" ? inserted.id : inserted;
    if (mongoId) positionIdMap.set(mongoId, newId);

    // Authority lines → unified authority_lines (with position_id)
    if (pos.authority_lines && pos.authority_lines.length > 0) {
      const lineRows = pos.authority_lines.map((line: any) => ({
        position_id: newId,
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
      await batchInsert(sqlDb, "authority_lines", lineRows);
    }

    // Audit lines → unified audit_lines (with position_id)
    if (pos.audit_lines && pos.audit_lines.length > 0) {
      const auditRows = pos.audit_lines.map((a: any) => ({
        position_id: newId,
        action: a.action || "Unknown",
        user_name: a.user_name || null,
        previous_value: a.previous_value ? JSON.stringify(a.previous_value) : null,
        audit_date: a.date,
      }));
      await batchInsert(sqlDb, "audit_lines", auditRows);
    }

    // Department reviews → workflow_steps
    if (pos.department_reviews && pos.department_reviews.length > 0) {
      for (const r of pos.department_reviews) {
        await sqlDb("workflow_steps").insert({
          position_id: newId,
          step_type: "department_review",
          outcome: r.result === "Approved" ? "approved" : "rejected",
          user_id: lookupId(userIdMap, r.user_id),
          user_name: r.name || null,
          note: r.note || null,
          step_date: r.date,
        });
      }
    }

    // Finance reviews → workflow_steps
    if (pos.finance_reviews && pos.finance_reviews.length > 0) {
      for (const r of pos.finance_reviews) {
        await sqlDb("workflow_steps").insert({
          position_id: newId,
          step_type: "finance_review",
          outcome: r.result === "Approved" ? "approved" : "rejected",
          user_id: lookupId(userIdMap, r.user_id),
          user_name: r.name || null,
          note: r.note || null,
          step_date: r.date,
        });
      }
    }
  }

  console.log(`  Migrated ${positions.length} positions`);
}

// =====================================================================
// Authorities (Form B) → normalized: employee/supervisor FKs,
//   workflow_steps, unified audit_lines, activations with effective_date
// =====================================================================

async function migrateAuthorities(mongoDB: any, sqlDb: Knex): Promise<void> {
  console.log("Migrating Authorities (Form B)...");
  const authorities = await mongoDB.collection("Authorities").find({}).toArray();

  // Collect employee UPNs for later population
  const employeeUpnMap = new Map<number, string>(); // employee SQL id → upn

  for (const auth of authorities) {
    const mongoId = resolveId(auth._id);

    const employeeSqlId = auth.employee?.value
      ? lookupId(employeeIdMap, auth.employee.value._id || auth.employee.value)
      : null;
    const supervisorSqlId = auth.supervisor?.value
      ? lookupId(employeeIdMap, auth.supervisor.value._id || auth.supervisor.value)
      : null;

    // Track UPNs for employee table population
    if (employeeSqlId && auth.employee?.upn) {
      employeeUpnMap.set(employeeSqlId, auth.employee.upn);
    }
    if (supervisorSqlId && auth.supervisor?.upn) {
      employeeUpnMap.set(supervisorSqlId, auth.supervisor.upn);
    }

    const [inserted] = await sqlDb("authorities")
      .insert({
        created_by_id: lookupId(userIdMap, auth.created_by_id),
        created_by_name: auth.created_by_name || auth.created_by || null,
        create_date: auth.create_date || null,
        cancel_date: auth.cancel_date || null,
        cancel_by_name: auth.cancel_by_name || null,
        authority_type: auth.authority_type || "substantive",
        form_a_id: lookupId(positionIdMap, auth.form_a_id),
        department_code: auth.department_code,
        program_branch: auth.program_branch || null,
        reject_comments: auth.reject_comments || null,
        // Employee FK + audit-trail fields
        employee_id: employeeSqlId,
        employee_name: auth.employee?.name || null,
        employee_title: auth.employee?.title || null,
        employee_signed_date: auth.employee?.signed_date || null,
        // Supervisor FK + audit-trail fields
        supervisor_id: supervisorSqlId,
        supervisor_name: auth.supervisor?.name || null,
        supervisor_title: auth.supervisor?.title || null,
        supervisor_signed_date: auth.supervisor?.signed_date || null,
      })
      .returning("id");

    const newId = typeof inserted === "object" ? inserted.id : inserted;
    if (!newId) {
      console.error(`  WARNING: Failed to get ID for authority ${mongoId}, skipping children`);
      continue;
    }
    if (mongoId) authorityIdMap.set(mongoId, newId);

    // Authority lines → unified authority_lines (with authority_id)
    if (auth.authority_lines && auth.authority_lines.length > 0) {
      const lineRows = auth.authority_lines.map((line: any) => ({
        authority_id: newId,
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
      try {
        await batchInsert(sqlDb, "authority_lines", lineRows);
      } catch (err: any) {
        console.error(`  ERROR inserting authority_lines for authority id=${newId}, mongo_id=${mongoId}`);
        throw err;
      }
    }

    // Audit lines → unified audit_lines (with authority_id)
    if (auth.audit_lines && auth.audit_lines.length > 0) {
      const auditRows = auth.audit_lines.map((a: any) => ({
        authority_id: newId,
        action: a.action || "Unknown",
        user_name: a.user_name || null,
        previous_value: a.previous_value ? JSON.stringify(a.previous_value) : null,
        audit_date: a.date,
      }));
      await batchInsert(sqlDb, "audit_lines", auditRows);
    }

    // Department reviews (array) → workflow_steps
    if (auth.department_reviews && Array.isArray(auth.department_reviews)) {
      for (const r of auth.department_reviews) {
        await sqlDb("workflow_steps").insert({
          authority_id: newId,
          step_type: "department_review",
          outcome: r.result === "Approved" ? "approved" : "rejected",
          user_id: lookupId(userIdMap, r.user_id),
          user_name: r.name || null,
          note: r.note || null,
          step_date: r.date || new Date(),
        });
      }
    }

    // Finance reviews (array) → workflow_steps
    if (auth.finance_reviews && Array.isArray(auth.finance_reviews)) {
      for (const r of auth.finance_reviews) {
        await sqlDb("workflow_steps").insert({
          authority_id: newId,
          step_type: "finance_review",
          outcome: r.result === "Approved" ? "approved" : "rejected",
          user_id: lookupId(userIdMap, r.user_id),
          user_name: r.name || null,
          note: r.note || null,
          step_date: r.date || new Date(),
        });
      }
    }

    // Upload signatures → workflow_steps
    if (auth.upload_signatures) {
      await sqlDb("workflow_steps").insert({
        authority_id: newId,
        step_type: "upload_signatures",
        outcome: "approved",
        user_id: lookupId(userIdMap, auth.upload_signatures.id),
        user_name: auth.upload_signatures.name || null,
        file_id: lookupId(fileIdMap, auth.upload_signatures.file_id),
        step_date: auth.upload_signatures.date || new Date(),
      });
    }

    // Activations → authority_activations (effective_date, no current_status)
    if (auth.activation && auth.activation.length > 0) {
      for (const act of auth.activation) {
        await sqlDb("authority_activations").insert({
          authority_id: newId,
          effective_date: act.date || null,
          expire_date: act.expire_date || null,
          activate_reason: act.activate_reason || null,
          archive_reason: act.archive_reason || null,
          activate_user_id: lookupId(userIdMap, act.activate_user_id),
          approve_user_email: act.approve_user_email || null,
          approve_user_date: act.approve_user_date || null,
          reject_user_date: act.reject_user_date || null,
          file_id: act.file ? lookupId(fileIdMap, act.file._id || act.file) : null,
          memo_id: act.memo ? lookupId(fileIdMap, act.memo._id || act.memo) : null,
        });
      }
    }
  }

  // Populate employee UPNs gathered from authority data
  console.log("  Populating employee UPNs...");
  let upnCount = 0;
  for (const [empId, upn] of employeeUpnMap) {
    const updated = await sqlDb("employees").where({ id: empId }).whereNull("upn").update({ upn });
    if (updated) upnCount++;
  }
  console.log(`  Updated ${upnCount} employee UPN records`);

  console.log(`  Migrated ${authorities.length} authorities`);
}

// =====================================================================
// Post-migration: map operational_restriction text → IDs
// =====================================================================

async function mapOperationalRestrictionIds(sqlDb: Knex): Promise<void> {
  console.log("Mapping operational_restriction text → IDs...");

  const restrictions = await sqlDb("operational_restrictions").select("id", "description");
  const textToId = new Map<string, number>();
  for (const r of restrictions) {
    textToId.set(r.description, r.id);
  }

  let count = 0;

  // authority_lines
  const lines = await sqlDb("authority_lines")
    .whereNotNull("operational_restriction")
    .whereNull("operational_restriction_id")
    .select("id", "operational_restriction");

  for (const line of lines) {
    const id = textToId.get(line.operational_restriction);
    if (id) {
      await sqlDb("authority_lines").where({ id: line.id }).update({ operational_restriction_id: id });
      count++;
    }
  }

  // position_group_snapshot_lines
  const snapLines = await sqlDb("position_group_snapshot_lines")
    .whereNotNull("operational_restriction")
    .whereNull("operational_restriction_id")
    .select("id", "operational_restriction");

  for (const line of snapLines) {
    const id = textToId.get(line.operational_restriction);
    if (id) {
      await sqlDb("position_group_snapshot_lines").where({ id: line.id }).update({ operational_restriction_id: id });
      count++;
    }
  }

  console.log(`  Mapped ${count} operational restriction references`);
}

// =====================================================================
// Verification
// =====================================================================

async function verify(mongoDB: any, sqlDb: Knex): Promise<void> {
  console.log("\n=== Verification ===");

  // Mongo vs SQL parent table counts
  const parentCollections = [
    { mongo: "Users", sql: "users" },
    { mongo: "Employees", sql: "employees" },
    { mongo: "OperationalRestrictions", sql: "operational_restrictions" },
    { mongo: "PositionGroups", sql: "position_groups" },
    { mongo: "FormA", sql: "positions" },
    { mongo: "Authorities", sql: "authorities" },
  ];

  for (const col of parentCollections) {
    const mongoCount = await mongoDB.collection(col.mongo).countDocuments();
    const [sqlResult] = await sqlDb(col.sql).count("* as count");
    const sqlCount = sqlResult.count;
    const match = mongoCount === sqlCount ? "OK" : "MISMATCH";
    console.log(`  ${col.mongo}: Mongo=${mongoCount}, MSSQL=${sqlCount} [${match}]`);
  }

  // New normalized table counts
  const newTables = [
    "departments", "user_roles", "user_department_admins",
    "stored_files", "authority_lines", "workflow_steps", "audit_lines",
    "authority_activations", "position_group_snapshots", "position_group_snapshot_lines",
  ];

  console.log("\n  New table row counts:");
  for (const table of newTables) {
    const [result] = await sqlDb(table).count("* as count");
    console.log(`    ${table}: ${result.count}`);
  }
}

// =====================================================================
// Main
// =====================================================================

async function main() {
  console.log("Starting MongoDB to MSSQL migration (normalized)...\n");

  const mongoClient = await MongoClient.connect(MONGO_URL);
  const mongoDB = mongoClient.db(MONGO_DB);
  console.log("Connected to MongoDB");

  const sqlDb = knex({
    client: "mssql",
    connection: {
      host: MSSQL_HOST,
      port: MSSQL_PORT,
      user: MSSQL_USER,
      password: MSSQL_PASSWORD,
      database: MSSQL_DB,
      options: { encrypt: false, trustServerCertificate: true },
    },
  });

  await sqlDb.raw("SELECT 1");
  console.log("Connected to MSSQL\n");

  // Pre-scan departments (needed before schema FK constraints)
  await prescanDepartments(mongoDB);

  // Create normalized schema
  await runSchema(sqlDb);

  // Insert departments first (FK target)
  await insertDepartments(sqlDb);

  // Migrate in dependency order
  await migrateUsers(mongoDB, sqlDb);
  await migrateFiles(mongoDB, sqlDb);
  await migrateEmployees(mongoDB, sqlDb);
  await migrateOperationalRestrictions(mongoDB, sqlDb);
  await migratePositionGroups(mongoDB, sqlDb);
  await migratePositions(mongoDB, sqlDb);
  await migratePositionGroupSnapshots(sqlDb);
  await migrateAuthorities(mongoDB, sqlDb);

  // Post-migration: map operational restriction text → FK IDs
  await mapOperationalRestrictionIds(sqlDb);

  // Verify
  await verify(mongoDB, sqlDb);

  await mongoClient.close();
  await sqlDb.destroy();

  console.log("\nMigration complete!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
