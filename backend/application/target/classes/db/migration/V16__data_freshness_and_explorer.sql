-- Phase 10: Data Freshness Engine and Provider Data Explorer
-- Adding fields to track data freshness, sync status and external timestamps

ALTER TABLE provider_raw_data
    ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN provider_timestamp TIMESTAMP WITH TIME ZONE,
    ADD COLUMN data_freshness VARCHAR(50),
    ADD COLUMN sync_status VARCHAR(50);
