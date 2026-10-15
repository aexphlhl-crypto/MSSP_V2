-- V23__Create_Subscription_And_Features.sql

-- Feature definitions
CREATE TABLE feature_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE, -- BRONZE, SILVER, GOLD
    description TEXT
);

CREATE TABLE feature_tree_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_tree_id UUID NOT NULL REFERENCES feature_trees(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL
);

-- Seed feature trees
INSERT INTO feature_trees (name, description) VALUES ('BRONZE', 'Bronze Tier Features');
INSERT INTO feature_trees (name, description) VALUES ('SILVER', 'Silver Tier Features');
INSERT INTO feature_trees (name, description) VALUES ('GOLD', 'Gold Tier Features');
