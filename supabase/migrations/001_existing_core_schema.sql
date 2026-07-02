-- 001_existing_core_schema.sql
-- SBP existing core schema baseline marker.
-- Your project already contains these application tables. This file does not recreate them.
-- Required existing tables used by Enterprise IAM:
--   tenants
--   tenant_users
--   departments
--   service_locations
--   audit_logs
-- Optional existing tables integrated by IAM if present:
--   api_keys
--   service_accounts
--   impersonation_events
--
-- This no-op migration exists so the migration folder has a clean baseline order.

create extension if not exists "pgcrypto";

select '001_existing_core_schema_ok' as status;
