-- V31__provider_entitlements.sql

CREATE TABLE plan_provider_entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    provider_type VARCHAR(100) NOT NULL
);

CREATE TABLE plan_provider_capabilities (
    plan_provider_entitlement_id UUID NOT NULL REFERENCES plan_provider_entitlements(id) ON DELETE CASCADE,
    capability VARCHAR(100) NOT NULL,
    PRIMARY KEY (plan_provider_entitlement_id, capability)
);

DO $$ 
DECLARE
    bronze_id UUID;
    silver_id UUID;
    gold_id UUID;
    ent_bronze_zabbix UUID := uuid_generate_v4();
    ent_silver_zabbix UUID := uuid_generate_v4();
    ent_gold_zabbix UUID := uuid_generate_v4();
    ent_gold_motadata UUID := uuid_generate_v4();
    ent_gold_prometheus UUID := uuid_generate_v4();
BEGIN
    SELECT id INTO bronze_id FROM plans WHERE name = 'Bronze';
    SELECT id INTO silver_id FROM plans WHERE name = 'Silver';
    SELECT id INTO gold_id FROM plans WHERE name = 'Gold';

    -- Bronze -> Zabbix
    IF bronze_id IS NOT NULL THEN
        INSERT INTO plan_provider_entitlements (id, plan_id, provider_type) VALUES (ent_bronze_zabbix, bronze_id, 'ZABBIX');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_bronze_zabbix, 'DEVICE_METRICS');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_bronze_zabbix, 'DEVICE_ALERTS');
    END IF;

    -- Silver -> Zabbix
    IF silver_id IS NOT NULL THEN
        INSERT INTO plan_provider_entitlements (id, plan_id, provider_type) VALUES (ent_silver_zabbix, silver_id, 'ZABBIX');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_silver_zabbix, 'DEVICE_METRICS');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_silver_zabbix, 'DEVICE_ALERTS');
    END IF;

    -- Gold -> Zabbix, Motadata, Prometheus
    IF gold_id IS NOT NULL THEN
        -- Zabbix
        INSERT INTO plan_provider_entitlements (id, plan_id, provider_type) VALUES (ent_gold_zabbix, gold_id, 'ZABBIX');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_gold_zabbix, 'DEVICE_METRICS');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_gold_zabbix, 'DEVICE_ALERTS');
        
        -- Motadata
        INSERT INTO plan_provider_entitlements (id, plan_id, provider_type) VALUES (ent_gold_motadata, gold_id, 'MOTADATA');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_gold_motadata, 'DEVICE_METRICS');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_gold_motadata, 'APM');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_gold_motadata, 'APPLICATION_MONITORING');
        
        -- Prometheus
        INSERT INTO plan_provider_entitlements (id, plan_id, provider_type) VALUES (ent_gold_prometheus, gold_id, 'PROMETHEUS');
        INSERT INTO plan_provider_capabilities (plan_provider_entitlement_id, capability) VALUES (ent_gold_prometheus, 'DEVICE_METRICS');
    END IF;
END $$;
