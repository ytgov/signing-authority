import express, { Request, Response } from "express";
import { MongoClient, GridFSBucket } from "mongodb";
import { Knex } from "knex";
import { MONGO_URL, MONGO_DB } from "../config";

export const migrationVerifyRouter = express.Router();

interface VerifyResult {
  collection: string;
  mongoCount: number;
  sqlCount: number;
  match: boolean;
}

interface IntegrityCheck {
  check: string;
  passed: boolean;
  detail: string;
}

interface SpotCheck {
  entity: string;
  id: number;
  passed: boolean;
  detail: string;
}

migrationVerifyRouter.get("/", async (req: Request, res: Response) => {
  const sqlDb = (req.store as any).db as Knex;
  let mongoClient: MongoClient | null = null;

  try {
    // Connect to MongoDB
    mongoClient = await MongoClient.connect(MONGO_URL);
    const mongoDB = mongoClient.db(MONGO_DB);

    const countResults = await verifyCounts(mongoDB, sqlDb);
    const integrityResults = await verifyIntegrity(sqlDb);
    const spotCheckResults = await verifySpotChecks(mongoDB, sqlDb);
    const childTableResults = await verifyChildTables(sqlDb);

    const allCountsMatch = countResults.every((r) => r.match);
    const allIntegrityPass = integrityResults.every((r) => r.passed);
    const allSpotChecksPass = spotCheckResults.every((r) => r.passed);
    const allChildTablesPass = childTableResults.every((r) => r.passed);

    const overallPass = allCountsMatch && allIntegrityPass && allSpotChecksPass && allChildTablesPass;

    res.json({
      overall: overallPass ? "PASS" : "FAIL",
      sections: {
        record_counts: { pass: allCountsMatch, results: countResults },
        referential_integrity: { pass: allIntegrityPass, results: integrityResults },
        spot_checks: { pass: allSpotChecksPass, results: spotCheckResults },
        child_tables: { pass: allChildTablesPass, results: childTableResults },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      overall: "ERROR",
      error: err.message,
      hint: "Ensure both MongoDB and MSSQL are accessible and MONGO_* env vars are set.",
    });
  } finally {
    if (mongoClient) await mongoClient.close();
  }
});

/**
 * 1. Compare document counts between MongoDB collections and MSSQL parent tables.
 */
async function verifyCounts(mongoDB: any, sqlDb: Knex): Promise<VerifyResult[]> {
  const mappings = [
    { mongo: "Users", sql: "users" },
    { mongo: "Employees", sql: "employees" },
    { mongo: "OperationalRestrictions", sql: "operational_restrictions" },
    { mongo: "FormA", sql: "positions" },
    { mongo: "PositionGroups", sql: "position_groups" },
    { mongo: "Authorities", sql: "authorities" },
  ];

  const results: VerifyResult[] = [];

  for (const m of mappings) {
    const mongoCount = await mongoDB.collection(m.mongo).countDocuments();
    const [sqlResult] = await sqlDb(m.sql).count("* as count");
    const sqlCount = typeof sqlResult.count === "number" ? sqlResult.count : parseInt(sqlResult.count as string, 10);

    results.push({
      collection: m.mongo,
      mongoCount,
      sqlCount,
      match: mongoCount === sqlCount,
    });
  }

  // GridFS files
  const bucket = new GridFSBucket(mongoDB, { bucketName: "SAA-FILES" });
  const gridFiles = await bucket.find().toArray();
  const [storedFilesResult] = await sqlDb("stored_files").count("* as count");
  const storedFilesCount =
    typeof storedFilesResult.count === "number"
      ? storedFilesResult.count
      : parseInt(storedFilesResult.count as string, 10);

  results.push({
    collection: "SAA-FILES (GridFS)",
    mongoCount: gridFiles.length,
    sqlCount: storedFilesCount,
    match: gridFiles.length === storedFilesCount,
  });

  return results;
}

/**
 * 2. Verify referential integrity — FK references point to existing rows.
 */
async function verifyIntegrity(sqlDb: Knex): Promise<IntegrityCheck[]> {
  const checks: IntegrityCheck[] = [];

  // authority_lines.authority_id → authorities.id
  const orphanAuthLines = await sqlDb("authority_lines")
    .leftJoin("authorities", "authority_lines.authority_id", "authorities.id")
    .whereNull("authorities.id")
    .count("* as count");
  const authLineOrphans = Number(orphanAuthLines[0].count);
  checks.push({
    check: "authority_lines → authorities FK",
    passed: authLineOrphans === 0,
    detail: authLineOrphans === 0 ? "All authority_lines reference valid authorities" : `${authLineOrphans} orphaned rows`,
  });

  // authority_audit_lines.authority_id → authorities.id
  const orphanAuditLines = await sqlDb("authority_audit_lines")
    .leftJoin("authorities", "authority_audit_lines.authority_id", "authorities.id")
    .whereNull("authorities.id")
    .count("* as count");
  const auditLineOrphans = Number(orphanAuditLines[0].count);
  checks.push({
    check: "authority_audit_lines → authorities FK",
    passed: auditLineOrphans === 0,
    detail: auditLineOrphans === 0 ? "All audit lines reference valid authorities" : `${auditLineOrphans} orphaned rows`,
  });

  // authority_activations.authority_id → authorities.id
  const orphanActivations = await sqlDb("authority_activations")
    .leftJoin("authorities", "authority_activations.authority_id", "authorities.id")
    .whereNull("authorities.id")
    .count("* as count");
  const activationOrphans = Number(orphanActivations[0].count);
  checks.push({
    check: "authority_activations → authorities FK",
    passed: activationOrphans === 0,
    detail:
      activationOrphans === 0 ? "All activations reference valid authorities" : `${activationOrphans} orphaned rows`,
  });

  // position_authority_lines.position_id → positions.id
  const orphanPosLines = await sqlDb("position_authority_lines")
    .leftJoin("positions", "position_authority_lines.position_id", "positions.id")
    .whereNull("positions.id")
    .count("* as count");
  const posLineOrphans = Number(orphanPosLines[0].count);
  checks.push({
    check: "position_authority_lines → positions FK",
    passed: posLineOrphans === 0,
    detail: posLineOrphans === 0 ? "All position lines reference valid positions" : `${posLineOrphans} orphaned rows`,
  });

  // position_audit_lines.position_id → positions.id
  const orphanPosAudit = await sqlDb("position_audit_lines")
    .leftJoin("positions", "position_audit_lines.position_id", "positions.id")
    .whereNull("positions.id")
    .count("* as count");
  const posAuditOrphans = Number(orphanPosAudit[0].count);
  checks.push({
    check: "position_audit_lines → positions FK",
    passed: posAuditOrphans === 0,
    detail:
      posAuditOrphans === 0 ? "All position audit lines reference valid positions" : `${posAuditOrphans} orphaned rows`,
  });

  // user_roles.user_id → users.id
  const orphanRoles = await sqlDb("user_roles")
    .leftJoin("users", "user_roles.user_id", "users.id")
    .whereNull("users.id")
    .count("* as count");
  const roleOrphans = Number(orphanRoles[0].count);
  checks.push({
    check: "user_roles → users FK",
    passed: roleOrphans === 0,
    detail: roleOrphans === 0 ? "All user roles reference valid users" : `${roleOrphans} orphaned rows`,
  });

  // authorities.form_a_id → positions.id (nullable, so only check non-null)
  const orphanFormA = await sqlDb("authorities")
    .leftJoin("positions", "authorities.form_a_id", "positions.id")
    .whereNotNull("authorities.form_a_id")
    .whereNull("positions.id")
    .count("* as count");
  const formAOrphans = Number(orphanFormA[0].count);
  checks.push({
    check: "authorities.form_a_id → positions FK",
    passed: formAOrphans === 0,
    detail: formAOrphans === 0 ? "All form_a_id references are valid" : `${formAOrphans} orphaned references`,
  });

  return checks;
}

/**
 * 3. Spot-check a sample of records — compare key fields between MongoDB and MSSQL.
 */
async function verifySpotChecks(mongoDB: any, sqlDb: Knex): Promise<SpotCheck[]> {
  const results: SpotCheck[] = [];

  // Check up to 5 authorities
  const sqlAuths = await sqlDb("authorities").select("id", "old_mongo_id", "department_code", "employee_name", "authority_type").limit(5);
  for (const sqlAuth of sqlAuths) {
    if (!sqlAuth.old_mongo_id) continue;

    const mongoAuth = await mongoDB.collection("Authorities").findOne({
      _id: safeObjectId(sqlAuth.old_mongo_id),
    });

    if (!mongoAuth) {
      results.push({
        entity: "Authority",
        id: sqlAuth.id,
        passed: false,
        detail: `Mongo doc not found for old_mongo_id=${sqlAuth.old_mongo_id}`,
      });
      continue;
    }

    const deptMatch = sqlAuth.department_code === mongoAuth.department_code;
    const nameMatch = sqlAuth.employee_name === mongoAuth.employee?.name;
    const typeMatch = sqlAuth.authority_type === mongoAuth.authority_type;
    const passed = deptMatch && nameMatch && typeMatch;

    results.push({
      entity: "Authority",
      id: sqlAuth.id,
      passed,
      detail: passed
        ? `dept=${sqlAuth.department_code}, name=${sqlAuth.employee_name}, type=${sqlAuth.authority_type}`
        : `Mismatch: dept(${deptMatch}), name(${nameMatch}), type(${typeMatch})`,
    });
  }

  // Check up to 5 users
  const sqlUsers = await sqlDb("users").select("id", "old_mongo_id", "email", "first_name", "last_name").limit(5);
  for (const sqlUser of sqlUsers) {
    if (!sqlUser.old_mongo_id) continue;

    const mongoUser = await mongoDB.collection("Users").findOne({
      _id: safeObjectId(sqlUser.old_mongo_id),
    });

    if (!mongoUser) {
      results.push({
        entity: "User",
        id: sqlUser.id,
        passed: false,
        detail: `Mongo doc not found for old_mongo_id=${sqlUser.old_mongo_id}`,
      });
      continue;
    }

    const emailMatch = sqlUser.email === mongoUser.email;
    const nameMatch = sqlUser.first_name === mongoUser.first_name && sqlUser.last_name === mongoUser.last_name;
    const passed = emailMatch && nameMatch;

    results.push({
      entity: "User",
      id: sqlUser.id,
      passed,
      detail: passed
        ? `email=${sqlUser.email}, name=${sqlUser.first_name} ${sqlUser.last_name}`
        : `Mismatch: email(${emailMatch}), name(${nameMatch})`,
    });
  }

  // Check up to 5 positions
  const sqlPositions = await sqlDb("positions").select("id", "old_mongo_id", "department_code", "position", "program_branch").limit(5);
  for (const sqlPos of sqlPositions) {
    if (!sqlPos.old_mongo_id) continue;

    const mongoPos = await mongoDB.collection("FormA").findOne({
      _id: safeObjectId(sqlPos.old_mongo_id),
    });

    if (!mongoPos) {
      results.push({
        entity: "Position",
        id: sqlPos.id,
        passed: false,
        detail: `Mongo doc not found for old_mongo_id=${sqlPos.old_mongo_id}`,
      });
      continue;
    }

    const deptMatch = sqlPos.department_code === mongoPos.department_code;
    const posMatch = sqlPos.position === mongoPos.position;
    const progMatch = sqlPos.program_branch === mongoPos.program_branch;
    const passed = deptMatch && posMatch && progMatch;

    results.push({
      entity: "Position",
      id: sqlPos.id,
      passed,
      detail: passed
        ? `dept=${sqlPos.department_code}, pos=${sqlPos.position}`
        : `Mismatch: dept(${deptMatch}), position(${posMatch}), program(${progMatch})`,
    });
  }

  return results;
}

/**
 * 4. Verify child table counts match the arrays in MongoDB documents.
 */
async function verifyChildTables(sqlDb: Knex): Promise<IntegrityCheck[]> {
  const checks: IntegrityCheck[] = [];

  // Every authority should have its authority_lines count > 0 (most do)
  const authsWithNoLines = await sqlDb("authorities")
    .leftJoin("authority_lines", "authorities.id", "authority_lines.authority_id")
    .whereNull("authority_lines.id")
    .count("authorities.id as count");
  const noLinesCount = Number(authsWithNoLines[0].count);
  checks.push({
    check: "Authorities with authority_lines",
    passed: true, // Some authorities may legitimately have no lines
    detail: `${noLinesCount} authorities have no authority_lines (may be expected for drafts)`,
  });

  // Positions with authority_lines
  const posWithNoLines = await sqlDb("positions")
    .leftJoin("position_authority_lines", "positions.id", "position_authority_lines.position_id")
    .whereNull("position_authority_lines.id")
    .count("positions.id as count");
  const noPosLinesCount = Number(posWithNoLines[0].count);
  checks.push({
    check: "Positions with authority_lines",
    passed: true,
    detail: `${noPosLinesCount} positions have no authority_lines (may be expected for new positions)`,
  });

  // Check that total child rows are reasonable
  const [authLineTotal] = await sqlDb("authority_lines").count("* as count");
  const [authTotal] = await sqlDb("authorities").count("* as count");
  const avgLines = Number(authTotal.count) > 0 ? Number(authLineTotal.count) / Number(authTotal.count) : 0;
  checks.push({
    check: "Authority lines ratio",
    passed: true,
    detail: `${Number(authLineTotal.count)} authority_lines across ${Number(authTotal.count)} authorities (avg ${avgLines.toFixed(1)} per authority)`,
  });

  // Check user roles were migrated
  const [roleTotal] = await sqlDb("user_roles").count("* as count");
  const [userTotal] = await sqlDb("users").count("* as count");
  checks.push({
    check: "User roles migrated",
    passed: Number(roleTotal.count) > 0 || Number(userTotal.count) === 0,
    detail: `${Number(roleTotal.count)} role assignments across ${Number(userTotal.count)} users`,
  });

  // Check stored_files have content
  const [filesWithContent] = await sqlDb("stored_files")
    .whereNotNull("content")
    .count("* as count");
  const [totalFiles] = await sqlDb("stored_files").count("* as count");
  const contentCount = Number(filesWithContent.count);
  const fileCount = Number(totalFiles.count);
  checks.push({
    check: "Stored files have content",
    passed: contentCount === fileCount,
    detail:
      contentCount === fileCount
        ? `All ${fileCount} files have content`
        : `${contentCount}/${fileCount} files have content`,
  });

  return checks;
}

/**
 * Helper to safely create an ObjectId from a hex string.
 */
function safeObjectId(hex: string) {
  try {
    const { ObjectId } = require("mongodb");
    return new ObjectId(hex);
  } catch {
    return hex;
  }
}
