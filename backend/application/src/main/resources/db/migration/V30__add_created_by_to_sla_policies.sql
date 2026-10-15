-- V30__add_created_by_to_sla_policies.sql
ALTER TABLE sla_policies ADD COLUMN created_by VARCHAR(255);
