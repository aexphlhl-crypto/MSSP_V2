-- V1__init_schema.sql

-- Enable UUID extension if supported by Postgres (optional but good practice)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    name VARCHAR(255) NOT NULL UNIQUE,
    tenant_identifier VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    tenant_identifier VARCHAR(255) NOT NULL REFERENCES tenants(tenant_identifier)
);

-- Insert a default tenant and admin user for Phase 1 testing
INSERT INTO tenants (id, name, tenant_identifier) 
VALUES (uuid_generate_v4(), 'System Admin Tenant', 'SYS_ADMIN');

-- Password is 'password' hashed with BCrypt (strength 10)
INSERT INTO users (id, email, password_hash, role, tenant_identifier) 
VALUES (uuid_generate_v4(), 'admin@mspportal.local', '$2a$10$wY1twTgHXPT2b.9R/u7.8.G.J3X8Nl5.P29C.t0O4L.Q5t2F2w1.e', 'ROLE_ADMIN', 'SYS_ADMIN');
