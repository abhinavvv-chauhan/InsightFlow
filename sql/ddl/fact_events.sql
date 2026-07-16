CREATE TABLE IF NOT EXISTS fact_events (
    event_key BIGSERIAL,
    date_key BIGINT NOT NULL REFERENCES dim_date(date_key),
    user_key BIGINT NOT NULL REFERENCES dim_user(user_key),
    product_key BIGINT REFERENCES dim_product(product_key),
    device_key BIGINT NOT NULL REFERENCES dim_device(device_key),
    location_key BIGINT NOT NULL REFERENCES dim_location(location_key),
    channel_key BIGINT NOT NULL REFERENCES dim_channel(channel_key),
    session_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_ts TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (event_key, date_key)
) PARTITION BY RANGE (date_key);

-- Indexes are created on the partitioned table; Postgres automatically creates them on individual partitions.
CREATE INDEX IF NOT EXISTS idx_fact_events_session_id ON fact_events(session_id);
CREATE INDEX IF NOT EXISTS idx_fact_events_user_ts ON fact_events(user_key, event_ts);
CREATE INDEX IF NOT EXISTS idx_fact_events_event_type ON fact_events(event_type);
