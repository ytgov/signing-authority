/**
 * Data normalization script: transforms the denormalized MSSQL schema
 * (from the MongoDB migration) into the new normalized schema.
 *
 * This script is self-contained — it creates new tables, migrates data,
 * then drops old tables/columns. Run it against the existing denormalized DB.
 *
 * Prerequisites:
 *   - The denormalized MSSQL database exists (created by migrate.ts from MongoDB)
 *   - BACK UP YOUR DATABASE before running this
 *
 * Usage: npx tsx src/migration/normalize.ts
 */

import knex, { Knex } from "knex";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

const {
  MSSQL_HOST = "localhost",
  MSSQL_USER = "sa",
  MSSQL_PASSWORD = "",
  MSSQL_DB = "signing_authority",
  MSSQL_PORT = "1433",
} = process.env;

async function main() {
  const db = knex({
    client: "mssql",
    connection: {
      host: MSSQL_HOST,
      port: parseInt(MSSQL_PORT, 10),
      user: MSSQL_USER,
      password: MSSQL_PASSWORD,
      database: MSSQL_DB,
      options: { encrypt: false, trustServerCertificate: true },
    },
  });

  try {
    console.log("=== Phase 1: Create new tables and columns ===\n");
    await phase1_createNewStructures(db);

    console.log("\n=== Phase 2: Migrate data ===\n");
    await phase2_migrateData(db);

    console.log("\n=== Phase 3: Cleanup old tables and columns ===\n");
    await phase3_cleanup(db);

    console.log("\n=== Phase 4: Add indexes ===\n");
    await phase4_addIndexes(db);

    console.log("\n=== Verification ===\n");
    await verify(db);

    console.log("\nNormalization migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// =====================================================================
// PHASE 1: Create new tables and add new columns to existing tables
// =====================================================================

async function phase1_createNewStructures(db: Knex) {
  // 1a. Create departments lookup table
  await safeExec(db, "Create departments table", `
    IF OBJECT_ID('departments', 'U') IS NULL
    CREATE TABLE departments (
      code            NVARCHAR(10) PRIMARY KEY,
      description     NVARCHAR(200) NOT NULL,
      display_name    NVARCHAR(200) NULL
    )
  `);

  // 1b. Create unified workflow_steps table
  await safeExec(db, "Create workflow_steps table", `
    IF OBJECT_ID('workflow_steps', 'U') IS NULL
    CREATE TABLE workflow_steps (
      id                      INT IDENTITY(1,1) PRIMARY KEY,
      position_group_id       INT NULL,
      position_id             INT NULL,
      authority_id            INT NULL,
      step_type               NVARCHAR(50) NOT NULL,
      outcome                 NVARCHAR(20) NOT NULL,
      user_id                 INT NULL,
      user_name               NVARCHAR(200) NULL,
      note                    NVARCHAR(MAX) NULL,
      file_id                 INT NULL,
      step_date               DATETIME2 NOT NULL
    )
  `);

  // 1c. Create unified audit_lines table
  await safeExec(db, "Create audit_lines table", `
    IF OBJECT_ID('audit_lines', 'U') IS NULL
    CREATE TABLE audit_lines (
      id              INT IDENTITY(1,1) PRIMARY KEY,
      position_id     INT NULL,
      authority_id    INT NULL,
      action          NVARCHAR(500) NOT NULL,
      user_name       NVARCHAR(200) NULL,
      previous_value  NVARCHAR(MAX) NULL,
      audit_date      DATETIME2 NOT NULL
    )
  `);

  // 1d. Create position_group_snapshots table
  await safeExec(db, "Create position_group_snapshots table", `
    IF OBJECT_ID('position_group_snapshots', 'U') IS NULL
    CREATE TABLE position_group_snapshots (
      id                      INT IDENTITY(1,1) PRIMARY KEY,
      position_group_id       INT NOT NULL,
      position_id             INT NOT NULL,
      position_name           NVARCHAR(200) NOT NULL,
      program_branch          NVARCHAR(200) NULL,
      activity                NVARCHAR(200) NULL,
      position_group_order    INT NULL,
      snapshot_date           DATETIME2 NOT NULL DEFAULT GETDATE()
    )
  `);

  // 1e. Create position_group_snapshot_lines table
  await safeExec(db, "Create position_group_snapshot_lines table", `
    IF OBJECT_ID('position_group_snapshot_lines', 'U') IS NULL
    CREATE TABLE position_group_snapshot_lines (
      id                              INT IDENTITY(1,1) PRIMARY KEY,
      snapshot_id                     INT NOT NULL,
      coding                          NVARCHAR(100) NOT NULL,
      coding_display                  NVARCHAR(200) NULL,
      operational_restriction         NVARCHAR(500) NULL,
      operational_restriction_id      INT NULL,
      notes                           NVARCHAR(MAX) NULL,
      contracts_for_goods_services    NVARCHAR(50) NULL,
      loans_and_guarantees            NVARCHAR(50) NULL,
      transfer_payments               NVARCHAR(50) NULL,
      authorization_for_travel        NVARCHAR(50) NULL,
      request_for_goods_services      NVARCHAR(50) NULL,
      assignment_authority            NVARCHAR(50) NULL,
      s29_performance_limit           NVARCHAR(50) NULL,
      s30_payment_limit               NVARCHAR(50) NULL
    )
  `);

  // 1f. Add new columns to authorities table
  await addColumnIfNotExists(db, "authorities", "employee_id", "INT NULL");
  await addColumnIfNotExists(db, "authorities", "supervisor_id", "INT NULL");

  // 1g. Add effective_date to authority_activations
  await addColumnIfNotExists(db, "authority_activations", "effective_date", "DATETIME2 NULL");

  // 1h. Add operational_restriction_id to existing authority_lines (if the old table uses text only)
  await addColumnIfNotExists(db, "authority_lines", "operational_restriction_id", "INT NULL");

  // 1i. Add position_id column to authority_lines for unified table
  // (old table only had authority_id; we need position_id for Form A lines)
  await addColumnIfNotExists(db, "authority_lines", "position_id", "INT NULL");

  // 1j. Add upn to employees
  await addColumnIfNotExists(db, "employees", "upn", "NVARCHAR(200) NULL");

  console.log("Phase 1 complete.");
}

// =====================================================================
// PHASE 2: Migrate data from old structures to new
// =====================================================================

async function phase2_migrateData(db: Knex) {
  await createDepartments(db);
  await migratePositionGroupWorkflowSteps(db);
  await migratePositionGroupSnapshots(db);
  await migratePositionAuthorityLines(db);
  await migratePositionReviewsToWorkflowSteps(db);
  await migratePositionAuditLines(db);
  await migrateAuthorityEmployeeSupervisorFKs(db);
  await migrateAuthorityReviewsToWorkflowSteps(db);
  await migrateAuthorityAuditLines(db);
  await migrateAuthorityActivationDates(db);
  await mapOperationalRestrictionIds(db);
  await populateEmployeeUpn(db);
}

async function createDepartments(db: Knex) {
  console.log("Creating departments lookup...");

  const deptMap = new Map<string, string>();

  // Gather distinct department codes from all sources
  for (const table of ["positions", "authorities", "position_groups"]) {
    const hasDescr = await columnExists(db, table, "department_descr");
    const cols = hasDescr ? ["department_code", "department_descr"] : ["department_code"];

    const rows = await db(table).distinct(...cols);
    for (const row of rows) {
      if (row.department_code && !deptMap.has(row.department_code)) {
        deptMap.set(row.department_code, row.department_descr || "");
      }
    }
  }

  for (const [code, description] of deptMap) {
    const exists = await db("departments").where({ code }).first();
    if (!exists) {
      await db("departments").insert({ code, description, display_name: description });
    }
  }

  console.log(`  Created ${deptMap.size} department records`);
}

async function migratePositionGroupWorkflowSteps(db: Knex) {
  console.log("Migrating position group approval columns → workflow_steps...");

  // Check if old flattened columns exist
  if (!(await columnExists(db, "position_groups", "finance_review_complete_user_id"))) {
    console.log("  Skipped — old columns not found (already migrated?)");
    return;
  }

  const groups = await db("position_groups").select("*");
  let count = 0;

  for (const g of groups) {
    if (g.finance_review_complete_user_id) {
      await db("workflow_steps").insert({
        position_group_id: g.id,
        step_type: "finance_review",
        outcome: "approved",
        user_id: g.finance_review_complete_user_id,
        user_name: g.finance_review_complete_name,
        note: g.finance_review_complete_comments,
        step_date: g.finance_review_complete_date,
      });
      count++;
    }
    if (g.finance_review_reject_user_id) {
      await db("workflow_steps").insert({
        position_group_id: g.id,
        step_type: "finance_review",
        outcome: "rejected",
        user_id: g.finance_review_reject_user_id,
        user_name: g.finance_review_reject_name,
        note: g.finance_review_reject_comments,
        step_date: g.finance_review_reject_date,
      });
      count++;
    }
    if (g.finance_approval_complete_user_id) {
      await db("workflow_steps").insert({
        position_group_id: g.id,
        step_type: "finance_approval",
        outcome: "approved",
        user_id: g.finance_approval_complete_user_id,
        user_name: g.finance_approval_complete_name,
        note: g.finance_approval_complete_comments,
        step_date: g.finance_approval_complete_date,
      });
      count++;
    }
    if (g.finance_approval_reject_user_id) {
      await db("workflow_steps").insert({
        position_group_id: g.id,
        step_type: "finance_approval",
        outcome: "rejected",
        user_id: g.finance_approval_reject_user_id,
        user_name: g.finance_approval_reject_name,
        note: g.finance_approval_reject_comments,
        step_date: g.finance_approval_reject_date,
      });
      count++;
    }
    if (g.upload_signatures_user_id) {
      await db("workflow_steps").insert({
        position_group_id: g.id,
        step_type: "upload_signatures",
        outcome: "approved",
        user_id: g.upload_signatures_user_id,
        user_name: g.upload_signatures_name,
        note: g.upload_signatures_comments,
        file_id: g.upload_signatures_file_id,
        step_date: g.upload_signatures_date,
      });
      count++;
    }
  }

  console.log(`  Migrated ${count} position group workflow steps`);
}

async function migratePositionGroupSnapshots(db: Knex) {
  console.log("Migrating position group activated positions → snapshots...");

  if (!(await tableExists(db, "position_group_activated_positions"))) {
    console.log("  Skipped — old table not found");
    return;
  }

  const rows = await db("position_group_activated_positions").select("*");
  let count = 0;

  for (const row of rows) {
    try {
      const pos = typeof row.position_data === "string"
        ? JSON.parse(row.position_data)
        : row.position_data;

      const [snapInserted] = await db("position_group_snapshots").insert({
        position_group_id: row.position_group_id,
        position_id: pos.id || pos._id || 0,
        position_name: pos.position || "",
        program_branch: pos.program_branch || null,
        activity: pos.activity || null,
        position_group_order: pos.position_group_order || null,
        snapshot_date: new Date(),
      }).returning("id");
      const snapId = typeof snapInserted === "object" ? snapInserted.id : snapInserted;

      if (pos.authority_lines) {
        for (const line of pos.authority_lines) {
          await db("position_group_snapshot_lines").insert({
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
    } catch (e) {
      console.error(`  Error parsing snapshot for group ${row.position_group_id}:`, e);
    }
  }

  console.log(`  Migrated ${count} position group snapshots`);
}

async function migratePositionAuthorityLines(db: Knex) {
  console.log("Migrating position_authority_lines → unified authority_lines...");

  if (!(await tableExists(db, "position_authority_lines"))) {
    console.log("  Skipped — old table not found");
    return;
  }

  const rows = await db("position_authority_lines").select("*");

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500).map((r: any) => ({
      position_id: r.position_id,
      coding: r.coding,
      coding_display: r.coding_display,
      dept: r.dept,
      vote: r.vote,
      prog: r.prog,
      activity: r.activity,
      element: r.element,
      allotment: r.allotment,
      object: r.object,
      ledger1: r.ledger1,
      ledger2: r.ledger2,
      operational_restriction: r.operational_restriction,
      notes: r.notes,
      contracts_for_goods_services: r.contracts_for_goods_services,
      loans_and_guarantees: r.loans_and_guarantees,
      transfer_payments: r.transfer_payments,
      authorization_for_travel: r.authorization_for_travel,
      request_for_goods_services: r.request_for_goods_services,
      assignment_authority: r.assignment_authority,
      s29_performance_limit: r.s29_performance_limit,
      s30_payment_limit: r.s30_payment_limit,
    }));
    await db("authority_lines").insert(batch);
  }

  console.log(`  Migrated ${rows.length} position authority lines into unified table`);
}

async function migratePositionReviewsToWorkflowSteps(db: Knex) {
  console.log("Migrating position reviews → workflow_steps...");
  let total = 0;

  if (await tableExists(db, "position_department_reviews")) {
    const deptReviews = await db("position_department_reviews").select("*");
    for (const r of deptReviews) {
      await db("workflow_steps").insert({
        position_id: r.position_id,
        step_type: "department_review",
        outcome: r.result === "Approved" ? "approved" : "rejected",
        user_id: r.user_id,
        user_name: r.name,
        note: r.note,
        step_date: r.date,
      });
    }
    total += deptReviews.length;
  }

  if (await tableExists(db, "position_finance_reviews")) {
    const finReviews = await db("position_finance_reviews").select("*");
    for (const r of finReviews) {
      await db("workflow_steps").insert({
        position_id: r.position_id,
        step_type: "finance_review",
        outcome: r.result === "Approved" ? "approved" : "rejected",
        user_id: r.user_id,
        user_name: r.name,
        note: r.note,
        step_date: r.date,
      });
    }
    total += finReviews.length;
  }

  console.log(`  Migrated ${total} position reviews`);
}

async function migratePositionAuditLines(db: Knex) {
  console.log("Migrating position_audit_lines → unified audit_lines...");

  if (!(await tableExists(db, "position_audit_lines"))) {
    console.log("  Skipped — old table not found");
    return;
  }

  const rows = await db("position_audit_lines").select("*");

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500).map((r: any) => ({
      position_id: r.position_id,
      action: r.action || "Unknown",
      user_name: r.user_name,
      previous_value: r.previous_value,
      audit_date: r.date,
    }));
    await db("audit_lines").insert(batch);
  }

  console.log(`  Migrated ${rows.length} position audit lines`);
}

async function migrateAuthorityEmployeeSupervisorFKs(db: Knex) {
  console.log("Migrating authority employee/supervisor value IDs → FK columns...");

  if (!(await columnExists(db, "authorities", "employee_value_id"))) {
    console.log("  Skipped — old columns not found");
    return;
  }

  const authorities = await db("authorities").select("id", "employee_value_id", "supervisor_value_id");
  let count = 0;

  for (const auth of authorities) {
    const updates: any = {};
    if (auth.employee_value_id) updates.employee_id = auth.employee_value_id;
    if (auth.supervisor_value_id) updates.supervisor_id = auth.supervisor_value_id;

    if (Object.keys(updates).length > 0) {
      await db("authorities").where({ id: auth.id }).update(updates);
      count++;
    }
  }

  console.log(`  Updated ${count} authority employee/supervisor FKs`);
}

async function migrateAuthorityReviewsToWorkflowSteps(db: Knex) {
  console.log("Migrating authority reviews → workflow_steps...");
  let count = 0;

  const selectCols = ["id"];
  if (await columnExists(db, "authorities", "department_reviews")) selectCols.push("department_reviews");
  if (await columnExists(db, "authorities", "finance_reviews")) selectCols.push("finance_reviews");
  if (await columnExists(db, "authorities", "upload_signatures_user_id")) {
    selectCols.push("upload_signatures_user_id", "upload_signatures_name",
      "upload_signatures_date", "upload_signatures_file_id");
  }

  if (selectCols.length === 1) {
    console.log("  Skipped — old review columns not found");
    return;
  }

  const authorities = await db("authorities").select(...selectCols);

  for (const auth of authorities) {
    // department_reviews JSON column
    if (auth.department_reviews) {
      try {
        const reviews = typeof auth.department_reviews === "string"
          ? JSON.parse(auth.department_reviews)
          : auth.department_reviews;
        for (const r of reviews) {
          await db("workflow_steps").insert({
            authority_id: auth.id,
            step_type: "department_review",
            outcome: r.result === "Approved" ? "approved" : "rejected",
            user_id: r.user_id || null,
            user_name: r.name || null,
            note: r.note || null,
            step_date: r.date || new Date(),
          });
          count++;
        }
      } catch (e) {
        console.error(`  Error parsing department_reviews for authority ${auth.id}`);
      }
    }

    // finance_reviews JSON column
    if (auth.finance_reviews) {
      try {
        const reviews = typeof auth.finance_reviews === "string"
          ? JSON.parse(auth.finance_reviews)
          : auth.finance_reviews;
        for (const r of reviews) {
          await db("workflow_steps").insert({
            authority_id: auth.id,
            step_type: "finance_review",
            outcome: r.result === "Approved" ? "approved" : "rejected",
            user_id: r.user_id || null,
            user_name: r.name || null,
            note: r.note || null,
            step_date: r.date || new Date(),
          });
          count++;
        }
      } catch (e) {
        console.error(`  Error parsing finance_reviews for authority ${auth.id}`);
      }
    }

    // upload_signatures flattened columns
    if (auth.upload_signatures_user_id) {
      await db("workflow_steps").insert({
        authority_id: auth.id,
        step_type: "upload_signatures",
        outcome: "approved",
        user_id: auth.upload_signatures_user_id,
        user_name: auth.upload_signatures_name,
        file_id: auth.upload_signatures_file_id,
        step_date: auth.upload_signatures_date || new Date(),
      });
      count++;
    }
  }

  console.log(`  Migrated ${count} authority workflow steps`);
}

async function migrateAuthorityAuditLines(db: Knex) {
  console.log("Migrating authority_audit_lines → unified audit_lines...");

  if (!(await tableExists(db, "authority_audit_lines"))) {
    console.log("  Skipped — old table not found");
    return;
  }

  const rows = await db("authority_audit_lines").select("*");

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500).map((r: any) => ({
      authority_id: r.authority_id,
      action: r.action || "Unknown",
      user_name: r.user_name,
      previous_value: r.previous_value,
      audit_date: r.date,
    }));
    await db("audit_lines").insert(batch);
  }

  console.log(`  Migrated ${rows.length} authority audit lines`);
}

async function migrateAuthorityActivationDates(db: Knex) {
  console.log("Migrating activation date → effective_date...");

  if (!(await columnExists(db, "authority_activations", "date"))) {
    console.log("  Skipped — old 'date' column not found");
    return;
  }

  await db.raw(`
    UPDATE authority_activations
    SET effective_date = [date]
    WHERE effective_date IS NULL AND [date] IS NOT NULL
  `);

  console.log("  Done");
}

async function mapOperationalRestrictionIds(db: Knex) {
  console.log("Mapping operational_restriction text → operational_restriction_id...");

  const restrictions = await db("operational_restrictions").select("id", "description");
  const textToId = new Map<string, number>();
  for (const r of restrictions) {
    textToId.set(r.description, r.id);
  }

  // Update authority_lines
  const lines = await db("authority_lines")
    .whereNotNull("operational_restriction")
    .whereNull("operational_restriction_id")
    .select("id", "operational_restriction");

  let count = 0;
  for (const line of lines) {
    const id = textToId.get(line.operational_restriction);
    if (id) {
      await db("authority_lines").where({ id: line.id }).update({ operational_restriction_id: id });
      count++;
    }
  }

  // Update snapshot lines
  const snapLines = await db("position_group_snapshot_lines")
    .whereNotNull("operational_restriction")
    .whereNull("operational_restriction_id")
    .select("id", "operational_restriction");

  for (const line of snapLines) {
    const id = textToId.get(line.operational_restriction);
    if (id) {
      await db("position_group_snapshot_lines").where({ id: line.id }).update({ operational_restriction_id: id });
      count++;
    }
  }

  console.log(`  Mapped ${count} operational restriction references`);
}

async function populateEmployeeUpn(db: Knex) {
  console.log("Populating employee UPN from old authority data...");

  if (!(await columnExists(db, "authorities", "employee_upn"))) {
    console.log("  Skipped — old employee_upn column not found");
    return;
  }

  const authorities = await db("authorities")
    .select("employee_value_id", "employee_upn")
    .whereNotNull("employee_value_id")
    .whereNotNull("employee_upn")
    .distinct();

  let count = 0;
  for (const auth of authorities) {
    const updated = await db("employees")
      .where({ id: auth.employee_value_id })
      .whereNull("upn")
      .update({ upn: auth.employee_upn });
    if (updated) count++;
  }

  const supervisors = await db("authorities")
    .select("supervisor_value_id", "supervisor_upn")
    .whereNotNull("supervisor_value_id")
    .whereNotNull("supervisor_upn")
    .distinct();

  for (const auth of supervisors) {
    const updated = await db("employees")
      .where({ id: auth.supervisor_value_id })
      .whereNull("upn")
      .update({ upn: auth.supervisor_upn });
    if (updated) count++;
  }

  console.log(`  Updated ${count} employee UPN records`);
}

// =====================================================================
// PHASE 3: Drop old tables and columns
// =====================================================================

async function phase3_cleanup(db: Knex) {
  // Drop old tables (order matters for FK dependencies)
  const oldTables = [
    "position_group_activated_positions",
    "position_authority_lines",
    "position_department_reviews",
    "position_finance_reviews",
    "position_audit_lines",
    "authority_audit_lines",
  ];

  for (const table of oldTables) {
    await safeExec(db, `Drop old table ${table}`,
      `IF OBJECT_ID('${table}', 'U') IS NOT NULL DROP TABLE ${table}`);
  }

  // Drop old columns from position_groups (flattened approval columns)
  const pgOldCols = [
    "finance_review_complete_user_id", "finance_review_complete_name",
    "finance_review_complete_comments", "finance_review_complete_date",
    "finance_review_reject_user_id", "finance_review_reject_name",
    "finance_review_reject_comments", "finance_review_reject_date",
    "finance_approval_complete_user_id", "finance_approval_complete_name",
    "finance_approval_complete_comments", "finance_approval_complete_date",
    "finance_approval_reject_user_id", "finance_approval_reject_name",
    "finance_approval_reject_comments", "finance_approval_reject_date",
    "upload_signatures_user_id", "upload_signatures_name",
    "upload_signatures_comments", "upload_signatures_date",
    "upload_signatures_file_id",
  ];
  for (const col of pgOldCols) {
    await dropColumnIfExists(db, "position_groups", col);
  }

  // Drop old columns from authorities
  const authOldCols = [
    "employee_value_id", "supervisor_value_id",
    "employee_upn", "employee_email", "employee_ynet_id",
    "supervisor_upn", "supervisor_email", "supervisor_ynet_id",
    "department_descr",
    "department_reviews", "finance_reviews",
    "upload_signatures_user_id", "upload_signatures_name",
    "upload_signatures_date", "upload_signatures_file_id",
  ];
  for (const col of authOldCols) {
    await dropColumnIfExists(db, "authorities", col);
  }

  // Drop old columns from positions
  await dropColumnIfExists(db, "positions", "department_descr");
  await dropColumnIfExists(db, "positions", "old_mongo_id");

  // Drop old columns from employees
  await dropColumnIfExists(db, "employees", "old_mongo_id");

  // Drop old columns from authority_activations
  await dropColumnIfExists(db, "authority_activations", "current_status");
  // Drop old 'date' column (replaced by effective_date)
  await dropColumnIfExists(db, "authority_activations", "date");

  // Drop old department_descr from position_groups
  await dropColumnIfExists(db, "position_groups", "department_descr");

  console.log("Phase 3 complete.");
}

// =====================================================================
// PHASE 4: Add FK constraints and indexes
// =====================================================================

async function phase4_addIndexes(db: Knex) {
  // Department FK constraints
  await safeExec(db, "FK employees.primary_department", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_employees_department')
    ALTER TABLE employees ADD CONSTRAINT FK_employees_department
      FOREIGN KEY (primary_department) REFERENCES departments(code)
  `);

  await safeExec(db, "FK positions.department_code", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_positions_department')
    ALTER TABLE positions ADD CONSTRAINT FK_positions_department
      FOREIGN KEY (department_code) REFERENCES departments(code)
  `);

  await safeExec(db, "FK authorities.department_code", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_authorities_department')
    ALTER TABLE authorities ADD CONSTRAINT FK_authorities_department
      FOREIGN KEY (department_code) REFERENCES departments(code)
  `);

  await safeExec(db, "FK position_groups.department_code", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_position_groups_department')
    ALTER TABLE position_groups ADD CONSTRAINT FK_position_groups_department
      FOREIGN KEY (department_code) REFERENCES departments(code)
  `);

  // Authority employee/supervisor FK constraints
  await safeExec(db, "FK authorities.employee_id", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_authorities_employee')
    ALTER TABLE authorities ADD CONSTRAINT FK_authorities_employee
      FOREIGN KEY (employee_id) REFERENCES employees(id)
  `);

  await safeExec(db, "FK authorities.supervisor_id", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_authorities_supervisor')
    ALTER TABLE authorities ADD CONSTRAINT FK_authorities_supervisor
      FOREIGN KEY (supervisor_id) REFERENCES employees(id)
  `);

  // Workflow steps FKs
  await safeExec(db, "FK workflow_steps.position_group_id", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_workflow_steps_pg')
    ALTER TABLE workflow_steps ADD CONSTRAINT FK_workflow_steps_pg
      FOREIGN KEY (position_group_id) REFERENCES position_groups(id) ON DELETE CASCADE
  `);

  await safeExec(db, "FK workflow_steps.position_id", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_workflow_steps_pos')
    ALTER TABLE workflow_steps ADD CONSTRAINT FK_workflow_steps_pos
      FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
  `);

  await safeExec(db, "FK workflow_steps.authority_id", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_workflow_steps_auth')
    ALTER TABLE workflow_steps ADD CONSTRAINT FK_workflow_steps_auth
      FOREIGN KEY (authority_id) REFERENCES authorities(id) ON DELETE CASCADE
  `);

  // Audit lines FKs
  await safeExec(db, "FK audit_lines.position_id", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_audit_lines_pos')
    ALTER TABLE audit_lines ADD CONSTRAINT FK_audit_lines_pos
      FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
  `);

  await safeExec(db, "FK audit_lines.authority_id", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_audit_lines_auth')
    ALTER TABLE audit_lines ADD CONSTRAINT FK_audit_lines_auth
      FOREIGN KEY (authority_id) REFERENCES authorities(id) ON DELETE CASCADE
  `);

  // Snapshot FKs
  await safeExec(db, "FK snapshots.position_group_id", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_pg_snapshots_group')
    ALTER TABLE position_group_snapshots ADD CONSTRAINT FK_pg_snapshots_group
      FOREIGN KEY (position_group_id) REFERENCES position_groups(id) ON DELETE CASCADE
  `);

  await safeExec(db, "FK snapshot_lines.snapshot_id", `
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_pg_snapshot_lines')
    ALTER TABLE position_group_snapshot_lines ADD CONSTRAINT FK_pg_snapshot_lines
      FOREIGN KEY (snapshot_id) REFERENCES position_group_snapshots(id) ON DELETE CASCADE
  `);

  // Indexes
  const indexes: [string, string, string][] = [
    ["IX_positions_department_code", "positions", "department_code"],
    ["IX_authorities_department_code", "authorities", "department_code"],
    ["IX_authorities_employee_id", "authorities", "employee_id"],
    ["IX_authorities_employee_name", "authorities", "employee_name"],
    ["IX_authorities_supervisor_id", "authorities", "supervisor_id"],
    ["IX_authorities_form_a_id", "authorities", "form_a_id"],
    ["IX_authorities_authority_type", "authorities", "authority_type"],
    ["IX_authorities_cancel_date", "authorities", "cancel_date"],
    ["IX_authority_lines_position_id", "authority_lines", "position_id"],
    ["IX_authority_lines_authority_id", "authority_lines", "authority_id"],
    ["IX_authority_lines_coding", "authority_lines", "coding"],
    ["IX_workflow_steps_pg_id", "workflow_steps", "position_group_id"],
    ["IX_workflow_steps_pos_id", "workflow_steps", "position_id"],
    ["IX_workflow_steps_auth_id", "workflow_steps", "authority_id"],
    ["IX_audit_lines_position_id", "audit_lines", "position_id"],
    ["IX_audit_lines_authority_id", "audit_lines", "authority_id"],
    ["IX_authority_activations_auth_id", "authority_activations", "authority_id"],
    ["IX_pg_snapshots_group_id", "position_group_snapshots", "position_group_id"],
    ["IX_positions_pg_id", "positions", "position_group_id"],
    ["IX_position_groups_dept", "position_groups", "department_code"],
    ["IX_position_groups_status", "position_groups", "status"],
    ["IX_employees_email", "employees", "email"],
    ["IX_employees_ynet_id", "employees", "ynet_id"],
  ];

  for (const [name, table, column] of indexes) {
    await safeExec(db, `Index ${name}`, `
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = '${name}')
      CREATE INDEX ${name} ON ${table}(${column})
    `);
  }

  console.log("Phase 4 complete.");
}

// =====================================================================
// Verification
// =====================================================================

async function verify(db: Knex) {
  const tables = [
    "departments",
    "users",
    "user_roles",
    "user_department_admins",
    "employees",
    "operational_restrictions",
    "stored_files",
    "position_groups",
    "positions",
    "authorities",
    "authority_lines",
    "workflow_steps",
    "audit_lines",
    "authority_activations",
    "position_group_snapshots",
    "position_group_snapshot_lines",
  ];

  for (const table of tables) {
    try {
      const [result] = await db(table).count("* as count");
      console.log(`  ${table}: ${result.count} rows`);
    } catch {
      console.log(`  ${table}: TABLE NOT FOUND`);
    }
  }
}

// =====================================================================
// Utility helpers
// =====================================================================

async function safeExec(db: Knex, label: string, sql: string): Promise<void> {
  try {
    await db.raw(sql);
    console.log(`  ✓ ${label}`);
  } catch (err: any) {
    console.error(`  ✗ ${label}: ${err.message}`);
  }
}

async function tableExists(db: Knex, table: string): Promise<boolean> {
  const result = await db.raw(
    `SELECT OBJECT_ID(?, 'U') AS obj_id`, [table]
  );
  return result[0]?.obj_id != null;
}

async function columnExists(db: Knex, table: string, column: string): Promise<boolean> {
  const result = await db.raw(`
    SELECT 1 AS found FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = ? AND COLUMN_NAME = ?
  `, [table, column]);
  return result.length > 0 && result[0]?.found === 1;
}

async function addColumnIfNotExists(db: Knex, table: string, column: string, definition: string): Promise<void> {
  const exists = await columnExists(db, table, column);
  if (!exists) {
    await safeExec(db, `Add ${table}.${column}`,
      `ALTER TABLE ${table} ADD ${column} ${definition}`);
  }
}

async function dropColumnIfExists(db: Knex, table: string, column: string): Promise<void> {
  const exists = await columnExists(db, table, column);
  if (exists) {
    // Drop any default constraints first (MSSQL requirement)
    await safeExec(db, `Drop defaults on ${table}.${column}`, `
      DECLARE @ConstraintName NVARCHAR(256)
      SELECT @ConstraintName = d.name
      FROM sys.default_constraints d
      JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
      WHERE c.object_id = OBJECT_ID('${table}') AND c.name = '${column}'
      IF @ConstraintName IS NOT NULL
        EXEC('ALTER TABLE ${table} DROP CONSTRAINT ' + @ConstraintName)
    `);

    await safeExec(db, `Drop ${table}.${column}`,
      `ALTER TABLE ${table} DROP COLUMN [${column}]`);
  }
}

main();
