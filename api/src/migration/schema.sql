-- MSSQL Normalized Schema for Signing Authority Application
-- Redesigned from denormalized MongoDB-style to proper relational model

-- ============================================
-- DROP EXISTING TABLES (reverse dependency order)
-- ============================================
IF OBJECT_ID('authority_activations', 'U') IS NOT NULL DROP TABLE authority_activations;
IF OBJECT_ID('audit_lines', 'U') IS NOT NULL DROP TABLE audit_lines;
IF OBJECT_ID('workflow_steps', 'U') IS NOT NULL DROP TABLE workflow_steps;
IF OBJECT_ID('authority_lines', 'U') IS NOT NULL DROP TABLE authority_lines;
IF OBJECT_ID('position_group_snapshot_lines', 'U') IS NOT NULL DROP TABLE position_group_snapshot_lines;
IF OBJECT_ID('position_group_snapshots', 'U') IS NOT NULL DROP TABLE position_group_snapshots;
IF OBJECT_ID('authorities', 'U') IS NOT NULL DROP TABLE authorities;
IF OBJECT_ID('positions', 'U') IS NOT NULL DROP TABLE positions;
IF OBJECT_ID('position_groups', 'U') IS NOT NULL DROP TABLE position_groups;
IF OBJECT_ID('stored_files', 'U') IS NOT NULL DROP TABLE stored_files;
IF OBJECT_ID('operational_restrictions', 'U') IS NOT NULL DROP TABLE operational_restrictions;
IF OBJECT_ID('employees', 'U') IS NOT NULL DROP TABLE employees;
IF OBJECT_ID('user_department_admins', 'U') IS NOT NULL DROP TABLE user_department_admins;
IF OBJECT_ID('user_roles', 'U') IS NOT NULL DROP TABLE user_roles;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID('departments', 'U') IS NOT NULL DROP TABLE departments;

-- Drop old tables that no longer exist in the normalized schema
IF OBJECT_ID('authority_audit_lines', 'U') IS NOT NULL DROP TABLE authority_audit_lines;
IF OBJECT_ID('authority_lines_old', 'U') IS NOT NULL DROP TABLE authority_lines_old;
IF OBJECT_ID('position_authority_lines', 'U') IS NOT NULL DROP TABLE position_authority_lines;
IF OBJECT_ID('position_audit_lines', 'U') IS NOT NULL DROP TABLE position_audit_lines;
IF OBJECT_ID('position_department_reviews', 'U') IS NOT NULL DROP TABLE position_department_reviews;
IF OBJECT_ID('position_finance_reviews', 'U') IS NOT NULL DROP TABLE position_finance_reviews;
IF OBJECT_ID('position_group_activated_positions', 'U') IS NOT NULL DROP TABLE position_group_activated_positions;

-- ============================================
-- DEPARTMENTS (new lookup table)
-- ============================================
CREATE TABLE departments (
    code            NVARCHAR(10) PRIMARY KEY,
    description     NVARCHAR(200) NOT NULL,
    display_name    NVARCHAR(200) NULL
);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    email           NVARCHAR(255) NOT NULL UNIQUE,
    sub             NVARCHAR(255) NULL,
    first_name      NVARCHAR(100) NOT NULL,
    last_name       NVARCHAR(100) NOT NULL,
    status          NVARCHAR(50) NULL,
    display_name    NVARCHAR(200) NULL,
    create_date     DATETIME2 NULL
);

CREATE TABLE user_roles (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            NVARCHAR(100) NOT NULL,
    UNIQUE (user_id, role)
);

CREATE TABLE user_department_admins (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_code NVARCHAR(10) NOT NULL REFERENCES departments(code),
    UNIQUE (user_id, department_code)
);

-- ============================================
-- EMPLOYEES
-- ============================================
CREATE TABLE employees (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    employee_id         INT NULL,
    first_name          NVARCHAR(100) NOT NULL,
    last_name           NVARCHAR(100) NOT NULL,
    ynet_id             NVARCHAR(100) NULL,
    upn                 NVARCHAR(200) NULL,
    email               NVARCHAR(255) NULL,
    primary_department  NVARCHAR(10) NULL REFERENCES departments(code),
    created_by          NVARCHAR(200) NULL,
    created_date        DATETIME2 NULL
);

-- ============================================
-- OPERATIONAL RESTRICTIONS
-- ============================================
CREATE TABLE operational_restrictions (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    description     NVARCHAR(500) NOT NULL,
    is_active       BIT NOT NULL DEFAULT 1,
    sort            INT NOT NULL DEFAULT 0
);

-- ============================================
-- STORED FILES (replacing GridFS)
-- ============================================
CREATE TABLE stored_files (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    filename        NVARCHAR(500) NOT NULL,
    file_size       INT NOT NULL,
    mime_type       NVARCHAR(200) NOT NULL,
    content         VARBINARY(MAX) NOT NULL,
    uploaded_by     NVARCHAR(200) NULL,
    upload_date     DATETIME2 NULL
);

-- ============================================
-- POSITION GROUPS
-- ============================================
CREATE TABLE position_groups (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    department_code     NVARCHAR(10) NOT NULL REFERENCES departments(code),
    program             NVARCHAR(200) NULL,
    activity            NVARCHAR(200) NULL,
    create_date         DATETIME2 NOT NULL,
    created_by          NVARCHAR(200) NULL,
    created_by_id       INT NULL REFERENCES users(id),
    status              NVARCHAR(50) NOT NULL,
    archive_date        DATETIME2 NULL
);

-- ============================================
-- POSITIONS (Form A)
-- ============================================
CREATE TABLE positions (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    department_code         NVARCHAR(10) NOT NULL REFERENCES departments(code),
    program_branch          NVARCHAR(200) NULL,
    activity                NVARCHAR(200) NULL,
    position                NVARCHAR(200) NOT NULL,
    is_deputy_minister      BIT NULL DEFAULT 0,
    is_deputy_duplicate     BIT NULL DEFAULT 0,
    position_group_id       INT NULL REFERENCES position_groups(id),
    position_group_order    INT NULL,
    -- activation (single event, not array)
    activation_date         DATETIME2 NULL,
    activation_user_id      INT NULL,
    activation_file_id      INT NULL REFERENCES stored_files(id),
    -- deactivation (single event)
    deactivation_date       DATETIME2 NULL,
    deactivation_reason     NVARCHAR(500) NULL,
    deactivation_by         NVARCHAR(255) NULL,
    deactivation_sub        NVARCHAR(255) NULL
);

-- ============================================
-- AUTHORITIES (Form B)
-- ============================================
CREATE TABLE authorities (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    created_by_id           INT NULL REFERENCES users(id),
    created_by_name         NVARCHAR(200) NULL,
    create_date             DATETIME2 NULL,
    cancel_date             DATETIME2 NULL,
    cancel_by_name          NVARCHAR(200) NULL,
    authority_type          NVARCHAR(50) NOT NULL DEFAULT 'substantive',
    form_a_id               INT NULL REFERENCES positions(id),
    department_code         NVARCHAR(10) NOT NULL REFERENCES departments(code),
    program_branch          NVARCHAR(200) NULL,
    reject_comments         NVARCHAR(MAX) NULL,
    -- employee (FK + audit-trail fields)
    employee_id             INT NULL REFERENCES employees(id),
    employee_name           NVARCHAR(200) NULL,
    employee_title          NVARCHAR(200) NULL,
    employee_signed_date    DATETIME2 NULL,
    -- supervisor (FK + audit-trail fields)
    supervisor_id           INT NULL REFERENCES employees(id),
    supervisor_name         NVARCHAR(200) NULL,
    supervisor_title        NVARCHAR(200) NULL,
    supervisor_signed_date  DATETIME2 NULL
);

-- ============================================
-- AUTHORITY LINES (unified: Form A + Form B)
-- ============================================
CREATE TABLE authority_lines (
    id                              INT IDENTITY(1,1) PRIMARY KEY,
    -- Polymorphic parent: exactly one is set
    position_id                     INT NULL REFERENCES positions(id) ON DELETE CASCADE,
    authority_id                    INT NULL REFERENCES authorities(id) ON DELETE CASCADE,
    -- Budget coding
    coding                          NVARCHAR(100) NOT NULL,
    coding_display                  NVARCHAR(200) NULL,
    dept                            NVARCHAR(10) NULL,
    vote                            NVARCHAR(10) NULL,
    prog                            NVARCHAR(10) NULL,
    activity                        NVARCHAR(10) NULL,
    element                         NVARCHAR(10) NULL,
    allotment                       NVARCHAR(10) NULL,
    [object]                        NVARCHAR(10) NULL,
    ledger1                         NVARCHAR(10) NULL,
    ledger2                         NVARCHAR(10) NULL,
    operational_restriction         NVARCHAR(500) NULL,
    operational_restriction_id      INT NULL REFERENCES operational_restrictions(id),
    notes                           NVARCHAR(MAX) NULL,
    -- Form A limit columns (NULL for Form B rows)
    contracts_for_goods_services    NVARCHAR(50) NULL,
    loans_and_guarantees            NVARCHAR(50) NULL,
    transfer_payments               NVARCHAR(50) NULL,
    authorization_for_travel        NVARCHAR(50) NULL,
    request_for_goods_services      NVARCHAR(50) NULL,
    assignment_authority            NVARCHAR(50) NULL,
    -- Form B limit columns (NULL for Form A rows)
    s24_procure_goods_limit         NVARCHAR(50) NULL,
    s24_procure_services_limit      NVARCHAR(50) NULL,
    s24_procure_request_limit       NVARCHAR(50) NULL,
    s24_procure_assignment_limit    NVARCHAR(50) NULL,
    s23_procure_goods_limit         NVARCHAR(50) NULL,
    s23_procure_services_limit      NVARCHAR(50) NULL,
    s24_transfer_limit              NVARCHAR(50) NULL,
    s23_transfer_limit              NVARCHAR(50) NULL,
    s24_travel_limit                NVARCHAR(50) NULL,
    other_limit                     NVARCHAR(50) NULL,
    loans_limit                     NVARCHAR(50) NULL,
    -- Shared between Form A and Form B
    s29_performance_limit           NVARCHAR(50) NULL,
    s30_payment_limit               NVARCHAR(50) NULL,
    -- Constraint: exactly one parent
    CONSTRAINT CK_authority_lines_parent CHECK (
        (position_id IS NOT NULL AND authority_id IS NULL)
        OR (position_id IS NULL AND authority_id IS NOT NULL)
    )
);

-- ============================================
-- WORKFLOW STEPS (unified approval steps for all form types)
-- ============================================
CREATE TABLE workflow_steps (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    -- Polymorphic parent: exactly one is set
    position_group_id       INT NULL REFERENCES position_groups(id) ON DELETE CASCADE,
    position_id             INT NULL REFERENCES positions(id) ON DELETE CASCADE,
    authority_id            INT NULL REFERENCES authorities(id) ON DELETE CASCADE,
    step_type               NVARCHAR(50) NOT NULL,  -- 'department_review','upload_signatures','finance_review','finance_approval'
    outcome                 NVARCHAR(20) NOT NULL,  -- 'approved','rejected'
    user_id                 INT NULL REFERENCES users(id),
    user_name               NVARCHAR(200) NULL,
    note                    NVARCHAR(MAX) NULL,
    file_id                 INT NULL REFERENCES stored_files(id),
    step_date               DATETIME2 NOT NULL,
    -- Constraint: exactly one parent
    CONSTRAINT CK_workflow_steps_parent CHECK (
        (position_group_id IS NOT NULL AND position_id IS NULL AND authority_id IS NULL)
        OR (position_group_id IS NULL AND position_id IS NOT NULL AND authority_id IS NULL)
        OR (position_group_id IS NULL AND position_id IS NULL AND authority_id IS NOT NULL)
    )
);

-- ============================================
-- AUDIT LINES (unified for positions + authorities)
-- ============================================
CREATE TABLE audit_lines (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    position_id     INT NULL REFERENCES positions(id) ON DELETE CASCADE,
    authority_id    INT NULL REFERENCES authorities(id) ON DELETE CASCADE,
    action          NVARCHAR(500) NOT NULL,
    user_name       NVARCHAR(200) NULL,
    previous_value  NVARCHAR(MAX) NULL,
    audit_date      DATETIME2 NOT NULL,
    CONSTRAINT CK_audit_lines_parent CHECK (
        (position_id IS NOT NULL AND authority_id IS NULL)
        OR (position_id IS NULL AND authority_id IS NOT NULL)
    )
);

-- ============================================
-- AUTHORITY ACTIVATIONS (Form B lifecycle)
-- ============================================
CREATE TABLE authority_activations (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    authority_id            INT NOT NULL REFERENCES authorities(id) ON DELETE CASCADE,
    effective_date          DATETIME2 NULL,
    expire_date             DATETIME2 NULL,
    activate_reason         NVARCHAR(100) NULL,
    archive_reason          NVARCHAR(200) NULL,
    activate_user_id        INT NULL,
    approve_user_email      NVARCHAR(255) NULL,
    approve_user_date       DATETIME2 NULL,
    reject_user_date        DATETIME2 NULL,
    file_id                 INT NULL REFERENCES stored_files(id),
    memo_id                 INT NULL REFERENCES stored_files(id)
);

-- ============================================
-- POSITION GROUP SNAPSHOTS (replaces JSON blobs)
-- ============================================
CREATE TABLE position_group_snapshots (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    position_group_id       INT NOT NULL REFERENCES position_groups(id) ON DELETE CASCADE,
    position_id             INT NOT NULL REFERENCES positions(id),
    position_name           NVARCHAR(200) NOT NULL,
    program_branch          NVARCHAR(200) NULL,
    activity                NVARCHAR(200) NULL,
    position_group_order    INT NULL,
    snapshot_date           DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE position_group_snapshot_lines (
    id                              INT IDENTITY(1,1) PRIMARY KEY,
    snapshot_id                     INT NOT NULL REFERENCES position_group_snapshots(id) ON DELETE CASCADE,
    coding                          NVARCHAR(100) NOT NULL,
    coding_display                  NVARCHAR(200) NULL,
    operational_restriction         NVARCHAR(500) NULL,
    operational_restriction_id      INT NULL REFERENCES operational_restrictions(id),
    notes                           NVARCHAR(MAX) NULL,
    contracts_for_goods_services    NVARCHAR(50) NULL,
    loans_and_guarantees            NVARCHAR(50) NULL,
    transfer_payments               NVARCHAR(50) NULL,
    authorization_for_travel        NVARCHAR(50) NULL,
    request_for_goods_services      NVARCHAR(50) NULL,
    assignment_authority            NVARCHAR(50) NULL,
    s29_performance_limit           NVARCHAR(50) NULL,
    s30_payment_limit               NVARCHAR(50) NULL
);

-- ============================================
-- INDEXES
-- ============================================

-- Department lookups
CREATE INDEX IX_positions_department_code ON positions(department_code);
CREATE INDEX IX_authorities_department_code ON authorities(department_code);
CREATE INDEX IX_position_groups_department_code ON position_groups(department_code);
CREATE INDEX IX_position_groups_status ON position_groups(status);

-- Authority employee/supervisor search
CREATE INDEX IX_authorities_employee_id ON authorities(employee_id);
CREATE INDEX IX_authorities_employee_name ON authorities(employee_name);
CREATE INDEX IX_authorities_supervisor_id ON authorities(supervisor_id);
CREATE INDEX IX_authorities_form_a_id ON authorities(form_a_id);
CREATE INDEX IX_authorities_authority_type ON authorities(authority_type);
CREATE INDEX IX_authorities_cancel_date ON authorities(cancel_date);

-- Authority lines
CREATE INDEX IX_authority_lines_position_id ON authority_lines(position_id);
CREATE INDEX IX_authority_lines_authority_id ON authority_lines(authority_id);
CREATE INDEX IX_authority_lines_coding ON authority_lines(coding);

-- Workflow steps
CREATE INDEX IX_workflow_steps_position_group_id ON workflow_steps(position_group_id);
CREATE INDEX IX_workflow_steps_position_id ON workflow_steps(position_id);
CREATE INDEX IX_workflow_steps_authority_id ON workflow_steps(authority_id);

-- Audit lines
CREATE INDEX IX_audit_lines_position_id ON audit_lines(position_id);
CREATE INDEX IX_audit_lines_authority_id ON audit_lines(authority_id);

-- Activations
CREATE INDEX IX_authority_activations_authority_id ON authority_activations(authority_id);
CREATE INDEX IX_authority_activations_dates ON authority_activations(effective_date, expire_date);

-- Position group snapshots
CREATE INDEX IX_pg_snapshots_group_id ON position_group_snapshots(position_group_id);

-- Positions
CREATE INDEX IX_positions_position_group_id ON positions(position_group_id);

-- Users
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_sub ON users(sub);
CREATE INDEX IX_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IX_user_department_admins_user_id ON user_department_admins(user_id);

-- Employees
CREATE INDEX IX_employees_email ON employees(email);
CREATE INDEX IX_employees_ynet_id ON employees(ynet_id);
