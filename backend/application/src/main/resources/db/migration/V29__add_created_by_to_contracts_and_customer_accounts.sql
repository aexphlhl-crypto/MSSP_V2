-- V29__add_created_by_to_contracts_and_customer_accounts.sql
ALTER TABLE customer_accounts ADD COLUMN created_by VARCHAR(255);
ALTER TABLE contracts ADD COLUMN created_by VARCHAR(255);
