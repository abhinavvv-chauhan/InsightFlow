import os
import sys
import pytest
import psycopg2
from dotenv import load_dotenv

# Ensure the root directory is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.db import PG_DSN, get_connection

load_dotenv()

def test_database_connection():
    """Verify that we can successfully connect to the database."""
    conn = psycopg2.connect(PG_DSN)
    assert conn is not None
    conn.close()

def test_tables_exist():
    """Verify that all required tables exist in the warehouse."""
    expected_tables = {
        'dim_date', 'dim_user', 'dim_product', 'dim_device',
        'dim_location', 'dim_channel', 'fact_events', 'fact_orders'
    }
    
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public';
            """)
            tables = {row[0] for row in cursor.fetchall()}
            
    for table in expected_tables:
        assert table in tables, f"Table {table} is missing from the database schema!"

def test_partitions_exist():
    """Verify that partitions for fact_events and fact_orders are created."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            # Check fact_events partitions
            cursor.execute("""
                SELECT child.relname AS partition_name
                FROM pg_inherits
                JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
                JOIN pg_class child ON pg_inherits.inhrelid = child.oid
                WHERE parent.relname = 'fact_events';
            """)
            event_partitions = {row[0] for row in cursor.fetchall()}
            
            # Check fact_orders partitions
            cursor.execute("""
                SELECT child.relname AS partition_name
                FROM pg_inherits
                JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
                JOIN pg_class child ON pg_inherits.inhrelid = child.oid
                WHERE parent.relname = 'fact_orders';
            """)
            order_partitions = {row[0] for row in cursor.fetchall()}
            
    assert 'fact_events_2026_01' in event_partitions
    assert 'fact_events_default' in event_partitions
    assert 'fact_orders_2026_01' in order_partitions
    assert 'fact_orders_default' in order_partitions

def test_dim_date_seeded():
    """Verify that the dim_date table is pre-populated with 365 rows for the year 2026."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM dim_date WHERE year = 2026;")
            count = cursor.fetchone()[0]
            
            # Verify specific date conversion and details
            cursor.execute("SELECT full_date, month_name, is_weekend, day_of_week FROM dim_date WHERE date_key = 20260714;")
            row = cursor.fetchone()
            
    assert count == 365, f"Expected 365 dates for year 2026, got {count}."
    assert row is not None
    assert row[1] == 'July'
    assert row[2] is False  # 2026-07-14 is a Tuesday (not weekend)
    assert row[3] == 2      # Tuesday = 2
