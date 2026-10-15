-- V3__seed_plans.sql

-- 1. Create Plans
DO $$ 
DECLARE
    bronze_id UUID := uuid_generate_v4();
    silver_id UUID := uuid_generate_v4();
    gold_id UUID := uuid_generate_v4();
BEGIN
    INSERT INTO plans (id, name, description) VALUES (bronze_id, 'Bronze', 'Basic MSP Features');
    INSERT INTO plans (id, name, description) VALUES (silver_id, 'Silver', 'Advanced Monitoring & Security');
    INSERT INTO plans (id, name, description) VALUES (gold_id, 'Gold', 'Full Suite with AI');

    -- 2. Seed Features

    -- Bronze Features
    INSERT INTO plan_features (plan_id, feature_key) VALUES (bronze_id, 'TICKETING');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (bronze_id, 'MONITORING_BASIC');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (bronze_id, 'BILLING');

    -- Silver Features (Includes Bronze)
    INSERT INTO plan_features (plan_id, feature_key) VALUES (silver_id, 'TICKETING');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (silver_id, 'MONITORING_BASIC');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (silver_id, 'MONITORING_ADVANCED');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (silver_id, 'SECURITY_OVERVIEW');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (silver_id, 'BACKUP_OVERVIEW');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (silver_id, 'REPORTING_BASIC');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (silver_id, 'BILLING');

    -- Gold Features (Includes Silver + more)
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'TICKETING');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'TICKETING_AI_CLASSIFY');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'MONITORING_BASIC');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'MONITORING_ADVANCED');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'SECURITY_OVERVIEW');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'SECURITY_VULNERABILITY');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'SECURITY_EDR');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'BACKUP_OVERVIEW');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'BACKUP_RESTORE');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'REPORTING_BASIC');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'REPORTING_COMPLIANCE');
    INSERT INTO plan_features (plan_id, feature_key) VALUES (gold_id, 'BILLING');

    -- 3. Assign Bronze to a new test customer tenant, Gold to another
    INSERT INTO tenants (id, name, tenant_identifier) VALUES (uuid_generate_v4(), 'Bronze Customer', 'TENANT_BRONZE');
    INSERT INTO users (id, email, password_hash, role, tenant_identifier) 
    VALUES (uuid_generate_v4(), 'bronze@mspportal.local', '$2a$10$wY1twTgHXPT2b.9R/u7.8.G.J3X8Nl5.P29C.t0O4L.Q5t2F2w1.e', 'ROLE_CUSTOMER_ADMIN', 'TENANT_BRONZE');
    
    INSERT INTO tenant_subscriptions (id, tenant_id, plan_id, status, start_at) 
    VALUES (uuid_generate_v4(), 'TENANT_BRONZE', bronze_id, 'ACTIVE', CURRENT_TIMESTAMP);

    INSERT INTO tenants (id, name, tenant_identifier) VALUES (uuid_generate_v4(), 'Gold Customer', 'TENANT_GOLD');
    INSERT INTO users (id, email, password_hash, role, tenant_identifier) 
    VALUES (uuid_generate_v4(), 'gold@mspportal.local', '$2a$10$wY1twTgHXPT2b.9R/u7.8.G.J3X8Nl5.P29C.t0O4L.Q5t2F2w1.e', 'ROLE_CUSTOMER_ADMIN', 'TENANT_GOLD');
    
    INSERT INTO tenant_subscriptions (id, tenant_id, plan_id, status, start_at) 
    VALUES (uuid_generate_v4(), 'TENANT_GOLD', gold_id, 'ACTIVE', CURRENT_TIMESTAMP);
END $$;

-- 4. Update existing Phase 1 admin user to be a Platform Admin
UPDATE users SET role = 'ROLE_PLATFORM_ADMIN' WHERE email = 'admin@mspportal.local';
