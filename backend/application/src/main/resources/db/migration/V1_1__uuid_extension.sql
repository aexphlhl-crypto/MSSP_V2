-- V1_1__uuid_extension.sql

-- Enable UUID extension required by V2 since V1 may be skipped during baseline
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
