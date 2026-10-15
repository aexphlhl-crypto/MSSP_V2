-- V28__alter_sla_policies_tenant_id.sql
ALTER TABLE sla_policies ALTER COLUMN tenant_id TYPE VARCHAR(255) USING tenant_id::text;
