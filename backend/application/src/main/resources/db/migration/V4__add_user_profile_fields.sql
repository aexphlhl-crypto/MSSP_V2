-- V4__add_user_profile_fields.sql

ALTER TABLE users ADD COLUMN name VARCHAR(255) DEFAULT 'Unknown User';
ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';

-- Update existing seed users
UPDATE users SET name = 'System Admin' WHERE email = 'admin@mspportal.local';
UPDATE users SET name = 'Bronze Admin' WHERE email = 'bronze@mspportal.local';
UPDATE users SET name = 'Gold Admin' WHERE email = 'gold@mspportal.local';
