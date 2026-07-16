CREATE TABLE IF NOT EXISTS fact_orders (
    order_key BIGSERIAL,
    date_key BIGINT NOT NULL REFERENCES dim_date(date_key),
    user_key BIGINT NOT NULL REFERENCES dim_user(user_key),
    product_key BIGINT NOT NULL REFERENCES dim_product(product_key),
    device_key BIGINT NOT NULL REFERENCES dim_device(device_key),
    location_key BIGINT NOT NULL REFERENCES dim_location(location_key),
    channel_key BIGINT NOT NULL REFERENCES dim_channel(channel_key),
    order_id VARCHAR(100) NOT NULL,
    order_amount NUMERIC(15, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) NOT NULL,
    PRIMARY KEY (order_key, date_key)
) PARTITION BY RANGE (date_key);

CREATE INDEX IF NOT EXISTS idx_fact_orders_user_key ON fact_orders(user_key);
CREATE INDEX IF NOT EXISTS idx_fact_orders_payment_status ON fact_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_fact_orders_payment_method ON fact_orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_fact_orders_order_id ON fact_orders(order_id);
