-- V26__ticket_domain_upgrade.sql
-- Phase 15: Ticket Domain Upgrade
-- Adds type, impact, subcategory, assignment group, related alert,
-- and provider connection linkage to the tickets table.
-- NOTE: No FK to incidents table because OperationalIncident is not a JPA entity (no DB table).
-- NOTE: No FK to sla_policies because SLA Policy entity does not exist yet.

ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS ticket_type     VARCHAR(50),
    ADD COLUMN IF NOT EXISTS subcategory     VARCHAR(100),
    ADD COLUMN IF NOT EXISTS impact          VARCHAR(50),
    ADD COLUMN IF NOT EXISTS assignment_group VARCHAR(255),
    ADD COLUMN IF NOT EXISTS related_incident_id UUID,
    ADD COLUMN IF NOT EXISTS related_alert_id    UUID REFERENCES alerts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS provider_connection_id UUID REFERENCES provider_connections(id) ON DELETE SET NULL;

-- Index for ticket type lookups
CREATE INDEX IF NOT EXISTS idx_tickets_tenant_type ON tickets(tenant_id, ticket_type);
-- Index for impact lookups
CREATE INDEX IF NOT EXISTS idx_tickets_tenant_impact ON tickets(tenant_id, impact);
-- Index for related alert lookups
CREATE INDEX IF NOT EXISTS idx_tickets_related_alert ON tickets(related_alert_id);
-- Index for provider connection lookups
CREATE INDEX IF NOT EXISTS idx_tickets_provider_connection ON tickets(provider_connection_id);
