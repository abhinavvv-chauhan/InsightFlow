import pandas as pd
from psycopg2.extras import execute_values
from utils.db import get_connection

def already_ingested(file_hash: str) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM etl_run_log WHERE file_hash = %s AND status = 'success'", (file_hash,))
            return bool(cur.fetchone())

def mark_ingested(tx_conn, file_hash: str) -> None:
    pass # handled in write_run_log

def upsert_dims(tx_conn, dims: dict) -> None:
    """Upserts dimensions and returns updated mappings."""
    with tx_conn.cursor() as cur:
        # User
        if not dims['user'].empty:
            execute_values(cur, """
                INSERT INTO dim_user (user_id, acquisition_channel)
                VALUES %s ON CONFLICT (user_id) DO NOTHING
            """, dims['user'][['user_id', 'acquisition_channel']].values.tolist())
            
        # Device
        if not dims['device'].empty:
            execute_values(cur, """
                INSERT INTO dim_device (device, browser, os_family, is_mobile)
                VALUES %s ON CONFLICT (device, browser) DO NOTHING
            """, dims['device'][['device', 'browser', 'os_family', 'is_mobile']].values.tolist())
            
        # Location
        if not dims['location'].empty:
            execute_values(cur, """
                INSERT INTO dim_location (city, country, region, tier)
                VALUES %s ON CONFLICT (city, country) DO NOTHING
            """, dims['location'][['city', 'country', 'region', 'tier']].values.tolist())
            
        # Channel
        if not dims['channel'].empty:
            execute_values(cur, """
                INSERT INTO dim_channel (traffic_source, campaign, channel_group)
                VALUES %s ON CONFLICT (traffic_source, campaign) DO NOTHING
            """, dims['channel'][['traffic_source', 'campaign', 'channel_group']].values.tolist())
            
        # Product
        if 'product' in dims and not dims['product'].empty:
            execute_values(cur, """
                INSERT INTO dim_product (product_id, product_name, category, sub_category, unit_price)
                VALUES %s ON CONFLICT (product_id) DO UPDATE SET
                    product_name = EXCLUDED.product_name,
                    category = EXCLUDED.category,
                    sub_category = EXCLUDED.sub_category,
                    unit_price = EXCLUDED.unit_price
            """, dims['product'][['product_id', 'product_name', 'category', 'sub_category', 'unit_price']].values.tolist())

def fetch_dim_keys(tx_conn):
    """Fetches all dimension keys for mapping."""
    keys = {}
    with tx_conn.cursor() as cur:
        cur.execute("SELECT user_id, user_key FROM dim_user")
        keys['user'] = {r[0]: r[1] for r in cur.fetchall()}
        
        cur.execute("SELECT device, browser, device_key FROM dim_device")
        keys['device'] = {(r[0], r[1]): r[2] for r in cur.fetchall()}
        
        cur.execute("SELECT city, country, location_key FROM dim_location")
        keys['location'] = {(r[0], r[1]): r[2] for r in cur.fetchall()}
        
        cur.execute("SELECT traffic_source, campaign, channel_key FROM dim_channel")
        keys['channel'] = {(r[0], r[1]): r[2] for r in cur.fetchall()}
        
        cur.execute("SELECT product_id, product_key FROM dim_product")
        keys['product'] = {r[0]: r[1] for r in cur.fetchall()}
        
    return keys

def insert_facts(tx_conn, df: pd.DataFrame) -> int:
    """Inserts records into fact_events and fact_orders."""
    inserted = 0
    with tx_conn.cursor() as cur:
        # Separate events and orders
        events_cols = ['date_key', 'user_key', 'product_key', 'device_key', 'location_key', 'channel_key', 'session_id', 'event_type', 'event_ts']
        events_df = df[events_cols].copy()
        events_df['event_ts'] = events_df['event_ts'].astype(str)
        # For events, replace NaN with None for database nulls. Must cast to object first!
        events_df = events_df.astype(object).where(pd.notnull(events_df), None)
        
        execute_values(cur, """
            INSERT INTO fact_events (date_key, user_key, product_key, device_key, location_key, channel_key, session_id, event_type, event_ts)
            VALUES %s
        """, events_df.values.tolist())
        inserted += len(events_df)
        
        if 'order_id' in df.columns:
            orders_df = df[df['order_id'].notna()].copy()
            if not orders_df.empty:
                orders_cols = ['date_key', 'user_key', 'product_key', 'device_key', 'location_key', 'channel_key', 'order_id', 'order_amount', 'quantity', 'payment_method', 'payment_status']
                orders_df = orders_df[orders_cols].astype(object).where(pd.notnull(orders_df), None)
                execute_values(cur, """
                    INSERT INTO fact_orders (date_key, user_key, product_key, device_key, location_key, channel_key, order_id, order_amount, quantity, payment_method, payment_status)
                    VALUES %s
                """, orders_df.values.tolist())
                inserted += len(orders_df)
                
    return inserted

def refresh_materialized_views():
    # Execute outside transaction block because CONCURRENTLY cannot run inside a block
    with get_connection() as conn:
        conn.autocommit = True
        with conn.cursor() as cur:
            try:
                cur.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY daily_kpis;")
            except Exception as e:
                print(f"Error refreshing materialized view: {e}")

def write_run_log(run_id, source_file, file_hash, rows_in, rows_loaded, rows_quarantined, status, started_at, finished_at, error_message=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO etl_run_log (run_id, source_file, file_hash, rows_in, rows_loaded, rows_quarantined, status, started_at, finished_at, error_message)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (run_id, source_file, file_hash, rows_in, rows_loaded, rows_quarantined, status, started_at, finished_at, error_message))
