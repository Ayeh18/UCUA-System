-- e-UCUA database schema.
--
-- Reconstructed from the queries the application runs. Every statement is idempotent
-- (IF NOT EXISTS), so it is safe to run against an existing database: it only creates
-- tables and indexes that are missing and never alters or drops existing ones.
--
--   psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS users (
    staff_id      VARCHAR(50)  PRIMARY KEY,
    password      TEXT         NOT NULL,
    name          TEXT         NOT NULL,
    username      TEXT,
    designation   TEXT,
    department    TEXT,
    dept_qhse     TEXT,
    phone_number  TEXT,
    email         TEXT,
    user_type     VARCHAR(20)  NOT NULL DEFAULT 'user',
    profile_pic   TEXT,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Staff IDs are looked up case-insensitively.
CREATE INDEX IF NOT EXISTS users_staff_id_lower_idx ON users (LOWER(staff_id));

-- Staff observation reports.
CREATE TABLE IF NOT EXISTS data_bank (
    id                          SERIAL PRIMARY KEY,
    staff_id                    VARCHAR(50) NOT NULL REFERENCES users (staff_id) ON UPDATE CASCADE,
    name                        TEXT,
    department                  TEXT,
    designation                 TEXT,
    date_time                   TIMESTAMP   NOT NULL,
    month                       VARCHAR(20),
    location                    TEXT        NOT NULL,
    specific_location           TEXT,
    observation_classification  TEXT        NOT NULL,
    call_for_stopwork           TEXT        NOT NULL,
    observation                 TEXT        NOT NULL,
    corrective_action           TEXT        NOT NULL,
    image                       TEXT[]      NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS data_bank_staff_date_idx ON data_bank (staff_id, date_time);
CREATE INDEX IF NOT EXISTS data_bank_date_idx ON data_bank (date_time);

-- Visitor observation reports (no account required).
CREATE TABLE IF NOT EXISTS data_bank_visitor (
    id              SERIAL PRIMARY KEY,
    name            TEXT      NOT NULL,
    phone           TEXT      NOT NULL,
    designation     TEXT      NOT NULL,
    company         TEXT      NOT NULL,
    other_company   TEXT,
    location        TEXT      NOT NULL,
    other_location  TEXT,
    classification  TEXT      NOT NULL,
    stop_work       TEXT      NOT NULL,
    observation     TEXT      NOT NULL,
    action          TEXT      NOT NULL,
    image_urls      TEXT[]    NOT NULL DEFAULT '{}',
    date_time       TIMESTAMP NOT NULL,
    month           VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS feedback (
    id             SERIAL PRIMARY KEY,
    staff_id       VARCHAR(50) NOT NULL,
    name           TEXT,
    feedback_type  TEXT        NOT NULL,
    message        TEXT        NOT NULL,
    date_time      TIMESTAMP   NOT NULL
);

-- Cached monthly points per staff member (the dashboard computes them live from data_bank;
-- this table is kept in sync on every report for external reporting tools).
CREATE TABLE IF NOT EXISTS points (
    staff_id         VARCHAR(50) PRIMARY KEY,
    report_count     INTEGER     NOT NULL DEFAULT 0,
    daily_points     INTEGER     NOT NULL DEFAULT 0,
    bonus_points     INTEGER     NOT NULL DEFAULT 0,
    total_points     INTEGER     NOT NULL DEFAULT 0,
    last_reset_date  DATE,
    updated_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dropdown reference data.
CREATE TABLE IF NOT EXISTS locations (
    id        SERIAL PRIMARY KEY,
    location  TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS company (
    id            SERIAL PRIMARY KEY,
    company_name  TEXT NOT NULL UNIQUE
);
