ALTER TABLE provider_raw_data ADD COLUMN endpoint VARCHAR(255);
ALTER TABLE provider_raw_data ADD COLUMN sync_run_id VARCHAR(255);
ALTER TABLE provider_raw_data ADD COLUMN ingestion_status VARCHAR(50);

ALTER TABLE provider_raw_data ADD CONSTRAINT unq_provider_raw_data 
UNIQUE (tenant_id, provider_connection_id, provider_object_id, payload_hash);
