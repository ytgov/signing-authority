# MongoDB to MSSQL Migration Guide

This document covers the full migration of the Signing Authority application from MongoDB 8.0 to Microsoft SQL Server, including data migration, schema details, and post-migration cleanup.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Schema Overview](#schema-overview)
5. [Running the Migration](#running-the-migration)
6. [Verifying the Migration](#verifying-the-migration)
7. [Post-Migration Cleanup](#post-migration-cleanup)
8. [Schema Design Decisions](#schema-design-decisions)
9. [Data Access Layer Changes](#data-access-layer-changes)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The application previously used MongoDB with the native `mongodb` driver (v6.1.0, no Mongoose). It has been rewritten to use **MSSQL** via **Knex.js** (query builder) with the **Tedious** driver.

**What changed:**

- 7 MongoDB collections → 17 MSSQL tables (parent tables + normalized child tables)
- `ObjectId` references → `INT IDENTITY` primary keys
- Nested document arrays → normalized child tables with foreign keys
- Single embedded objects → flattened as prefixed columns on the parent table
- GridFS file storage → `VARBINARY(MAX)` column in `stored_files` table
- All route/service code updated to remove `mongodb` dependency

**What didn't change:**

- Express route structure and endpoint URLs
- API response shapes (backward compatible with the frontend)
- Business logic (status calculations, email notifications, scheduled jobs)
- Authentication (Auth0 / JWT)

---

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** instance (source) — must be accessible during migration
- **SQL Server** 2019+ or Azure SQL — target database
- The `mongodb` npm package is still needed for the migration script; it was removed from the application's runtime dependencies

Install the migration dependency if needed:

```bash
cd api
npm install mongodb --save-dev
```

---

## Environment Setup

Add the following variables to your `.env.development` (or `.env.production`):

```env
# MSSQL connection (required for the application)
MSSQL_HOST=localhost
MSSQL_USER=sa
MSSQL_PASSWORD=YourStrong!Passw0rd
MSSQL_DB=signing_authority
MSSQL_PORT=1433

# MongoDB connection (required only for migration)
MONGO_USERNAME=admin
MONGO_PASSWORD=password
MONGO_HOST=localhost:27017
MONGO_DB=authorities
MONGO_FILEBUCKET=FormB
```

If running SQL Server locally via Docker:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" \
  -p 1433:1433 --name signing-authority-mssql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

---

## Schema Overview

The MSSQL schema is defined in [`api/src/migration/schema.sql`](api/src/migration/schema.sql). The migration script runs this automatically, but you can also execute it manually against your database.

### Table Map

| MongoDB Collection | MSSQL Parent Table | Child Tables |
|---|---|---|
| `Users` | `users` | `user_roles`, `user_department_admins` |
| `Employees` | `employees` | — |
| `OperationalRestrictions` | `operational_restrictions` | — |
| `SAA-FILES` (GridFS) | `stored_files` | — |
| `PositionGroups` | `position_groups` | `position_group_activated_positions` |
| `FormA` | `positions` | `position_authority_lines`, `position_audit_lines`, `position_department_reviews`, `position_finance_reviews` |
| `Authorities` | `authorities` | `authority_lines`, `authority_audit_lines`, `authority_activations` |

### Key Design Decisions

- **`old_mongo_id`** column on every parent table stores the original MongoDB `ObjectId` hex string. Used during migration to map foreign key references and for verification. Can be dropped after migration is confirmed.
- **`INT IDENTITY` primary keys** replace all `ObjectId` usage.
- **`_id` alias** — The data access layer adds `_id` as an alias for `id` on every returned row, so frontend code that references `item._id` continues to work without changes.
- **Nested objects flattened** — Single embedded objects like `employee`, `supervisor`, `activation`, and `upload_signatures` are stored as prefixed columns on the parent table (e.g., `employee_name`, `employee_email`, `supervisor_title`).
- **Arrays normalized** — Arrays like `authority_lines`, `audit_lines`, and `activations` are stored in child tables with a foreign key to the parent.
- **Reviews stored as JSON** — `department_reviews` and `finance_reviews` on authorities are stored as `NVARCHAR(MAX)` JSON columns since they are small arrays and only read/written as a whole.
- **`previous_value` in audit lines** — Stored as `NVARCHAR(MAX)` JSON. These are read-only historical snapshots.

---

## Running the Migration

The migration script connects to both MongoDB and MSSQL simultaneously, reads all data from MongoDB, and inserts it into MSSQL with proper ID mapping.

### Step 1: Create the MSSQL Database

```sql
CREATE DATABASE signing_authority;
```

### Step 2: Run the Migration

```bash
cd api
npx tsx src/migration/migrate.ts
```

The script will:

1. **Create the schema** — Runs `schema.sql` (drops tables if they exist, then creates them)
2. **Migrate in dependency order:**
   - `Users` → `users` + `user_roles` + `user_department_admins`
   - `SAA-FILES` (GridFS) → `stored_files`
   - `Employees` → `employees`
   - `OperationalRestrictions` → `operational_restrictions`
   - `PositionGroups` → `position_groups` + `position_group_activated_positions`
   - `FormA` → `positions` + 4 child tables
   - `Authorities` → `authorities` + 3 child tables
3. **Build ID maps** — At each step, a `Map<string, number>` maps old MongoDB hex IDs to new SQL integer IDs, used to resolve foreign key references in later steps
4. **Verify counts** — Prints a summary comparing document counts between MongoDB and MSSQL

### What to Expect

```
Starting MongoDB to MSSQL migration...

Connected to MongoDB
Connected to MSSQL

Running schema...
Migrating Users...
  Migrated 25 users
Migrating Files (GridFS)...
  Migrated 12 files
Migrating Employees...
  Migrated 150 employees
...
Verification:
  Users: Mongo=25, MSSQL=25 [OK]
  Authorities: Mongo=340, MSSQL=340 [OK]
  ...

Migration complete!
```

### Re-running the Migration

The script drops and recreates all tables each time, so it is safe to re-run. All existing MSSQL data will be replaced.

---

## Verifying the Migration

After running the migration script, hit the verification endpoint to perform comprehensive checks.

### Verification Endpoint

```
GET http://localhost:3000/api/migration-verify
```

This endpoint requires both MongoDB and MSSQL to be accessible. It runs four categories of checks:

#### 1. Record Counts

Compares document counts between each MongoDB collection and its MSSQL table. All counts should match.

#### 2. Referential Integrity

Checks that all foreign key references in child tables point to existing parent rows:

- `authority_lines.authority_id` → `authorities.id`
- `authority_audit_lines.authority_id` → `authorities.id`
- `authority_activations.authority_id` → `authorities.id`
- `position_authority_lines.position_id` → `positions.id`
- `position_audit_lines.position_id` → `positions.id`
- `user_roles.user_id` → `users.id`
- `authorities.form_a_id` → `positions.id`

#### 3. Spot Checks

Samples up to 5 records each from authorities, users, and positions. For each record, looks up the original MongoDB document by `old_mongo_id` and compares key fields (department_code, employee name, email, authority_type, etc.).

#### 4. Child Table Statistics

Reports on:

- Authority lines per authority (average ratio)
- User role assignments
- Whether all stored files have content

### Expected Response

```json
{
  "overall": "PASS",
  "sections": {
    "record_counts": {
      "pass": true,
      "results": [
        { "collection": "Users", "mongoCount": 25, "sqlCount": 25, "match": true },
        { "collection": "Authorities", "mongoCount": 340, "sqlCount": 340, "match": true }
      ]
    },
    "referential_integrity": { "pass": true, "results": [...] },
    "spot_checks": { "pass": true, "results": [...] },
    "child_tables": { "pass": true, "results": [...] }
  }
}
```

If `overall` is `"FAIL"`, inspect the individual sections to identify which checks failed.

---

## Post-Migration Cleanup

Once the migration is verified and the application is running correctly against MSSQL:

### 1. Remove MongoDB Dependency

The `mongodb` package has already been removed from `package.json` dependencies. If you added it back as a devDependency for migration, remove it:

```bash
cd api
npm uninstall mongodb
```

### 2. Remove MONGO_* Environment Variables

Remove these from your `.env.development` and `.env.production` files:

```env
MONGO_USERNAME=...
MONGO_PASSWORD=...
MONGO_HOST=...
MONGO_DB=...
MONGO_FILEBUCKET=...
```

### 3. Remove MONGO_* Config Exports

In `api/src/config.ts`, remove:

```typescript
export const MONGO_DB = process.env.MONGO_DB || "";
export const MONGO_HOST = process.env.MONGO_HOST || "";
export const MONGO_URL = `mongodb://...`;
```

### 4. Remove Migration Files

These can be removed once migration is confirmed:

- `api/src/migration/migrate.ts`
- `api/src/migration/schema.sql`
- `api/src/routes/migration-verify-router.ts`
- The migration verify route in `api/src/index.ts`

### 5. Drop `old_mongo_id` Columns

Once you're confident the migration is complete and no rollback is needed:

```sql
ALTER TABLE users DROP COLUMN old_mongo_id;
ALTER TABLE employees DROP COLUMN old_mongo_id;
ALTER TABLE operational_restrictions DROP COLUMN old_mongo_id;
ALTER TABLE stored_files DROP COLUMN old_mongo_id;
ALTER TABLE position_groups DROP COLUMN old_mongo_id;
ALTER TABLE positions DROP COLUMN old_mongo_id;
ALTER TABLE authorities DROP COLUMN old_mongo_id;
```

### 6. Decommission MongoDB

Shut down the MongoDB instance or remove it from Docker Compose.

---

## Data Access Layer Changes

### Service Architecture

| Service | Table(s) | Purpose |
|---|---|---|
| `GenericService<T>` | Any single table | Simple CRUD for flat entities (employees, operational_restrictions) |
| `AuthorityService` | `authorities` + 3 child tables | Assembles/disassembles nested Authority objects from parent + child rows |
| `PositionService` | `positions` + 4 child tables | Same pattern for Position (Form A) entities |
| `PositionGroupService` | `position_groups` + 1 child table | Handles flattened approval objects and activated_positions snapshots |
| `UserService` | `users` + 2 junction tables | Manages roles and department_admin_for as normalized arrays |
| `SqlFileStore` | `stored_files` | Implements `FileStore` interface, replaces GridFS |

### Query Translation

The specialized services (`AuthorityService`, `PositionService`, `PositionGroupService`) accept MongoDB-style query objects and translate them internally. This means route code can use familiar patterns:

| MongoDB Pattern | Translated To |
|---|---|
| `{ "employee.email": value }` | `.where("employee_email", value)` |
| `{ $regex: /term/i }` | `.where(col, "LIKE", "%term%")` |
| `{ field: { $exists: false } }` | `.whereNull(col)` |
| `{ field: { $nin: [...] } }` | `.whereNotIn(col, [...])` |
| `{ $and: [...] }` | Chained `.where()` calls |
| `{ $or: [...] }` | `.where(b => b.orWhere(...))` |
| `{ $elemMatch: { ... } }` | `whereExists(subquery on child table)` |

---

## Troubleshooting

### Migration script fails to connect to MongoDB

- Ensure MongoDB is running and accessible at the `MONGO_HOST` address
- Check `MONGO_USERNAME` and `MONGO_PASSWORD` are correct
- Verify the `MONGO_DB` database name matches your existing database

### Migration script fails to connect to MSSQL

- Ensure SQL Server is running on `MSSQL_HOST:MSSQL_PORT`
- Check the `MSSQL_USER` has permission to create tables and insert data
- If using Docker, ensure the container is healthy: `docker logs signing-authority-mssql`

### Count mismatch after migration

- Re-run the migration script (it drops and recreates all tables)
- Check for MongoDB documents with unusual shapes that may have been skipped
- Review the console output for any error messages during migration

### Application errors after switching to MSSQL

- Ensure all `.env` files have the `MSSQL_*` variables set
- Run `npm install` to ensure `knex` and `tedious` are installed
- Check that the SQL Server firewall allows connections on port 1433

### "aggregate() called on GenericService" warning

This warning appears if code calls the MongoDB `aggregate()` method on a `GenericService` instance. The `PositionService` overrides this method to handle the one aggregate query used in the application (department position count). Ensure the route is using `PositionService` (via `req.store.FormA`), not a bare `GenericService`.

### Verification endpoint returns "ERROR"

- Both MongoDB and MSSQL must be accessible for the verification endpoint to work
- Ensure `MONGO_*` environment variables are still set (they can be removed after verification)
- The `mongodb` package must be installed (add as devDependency if it was removed)
