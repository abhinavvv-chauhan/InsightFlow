import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from urllib.parse import urlparse, urlunparse
from dotenv import load_dotenv

# Ensure the root directory is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.db import PG_DSN, get_connection
from utils.logger import setup_logger

logger = setup_logger("insightflow.setup_warehouse")

def create_database_if_not_exists():
    parsed = urlparse(PG_DSN)
    dbname = parsed.path.lstrip('/')
    
    if dbname and dbname != 'postgres':
        # Connect to 'postgres' to check and create the target database
        postgres_parsed = parsed._replace(path='/postgres')
        postgres_dsn = urlunparse(postgres_parsed)
        
        try:
            conn = psycopg2.connect(postgres_dsn)
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            
            cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s;", (dbname,))
            exists = cursor.fetchone()
            
            if not exists:
                logger.info(f"Database '{dbname}' does not exist. Creating...")
                cursor.execute(f"CREATE DATABASE {dbname};")
                logger.info(f"Database '{dbname}' created successfully.")
            else:
                logger.info(f"Database '{dbname}' already exists.")
                
            cursor.close()
            conn.close()
        except Exception as e:
            logger.warning(f"Could not check/create database '{dbname}': {e}. Continuing anyway...")

def run_ddl_file(conn, filepath):
    logger.info(f"Running DDL from {filepath}...")
    with open(filepath, 'r') as f:
        sql = f.read()
    
    with conn.cursor() as cursor:
        try:
            cursor.execute(sql)
            conn.commit()
            logger.info(f"Successfully executed DDL from {filepath}.")
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to execute DDL from {filepath}: {e}")
            raise e

def seed_dim_date(conn):
    logger.info("Seeding dim_date table for the year 2026...")
    seed_sql = """
    INSERT INTO dim_date (
        date_key,
        full_date,
        day,
        month,
        month_name,
        quarter,
        year,
        week_of_year,
        day_of_week,
        is_weekend
    )
    WITH RECURSIVE date_spine(d) AS (
        SELECT DATE '2026-01-01'
        UNION ALL
        SELECT d + 1 FROM date_spine WHERE d < DATE '2026-12-31'
    )
    SELECT
        CAST(TO_CHAR(d, 'YYYYMMDD') AS BIGINT) AS date_key,
        d AS full_date,
        CAST(EXTRACT(DAY FROM d) AS SMALLINT) AS day,
        CAST(EXTRACT(MONTH FROM d) AS SMALLINT) AS month,
        TRIM(TO_CHAR(d, 'Month')) AS month_name,
        CAST(EXTRACT(QUARTER FROM d) AS SMALLINT) AS quarter,
        CAST(EXTRACT(YEAR FROM d) AS SMALLINT) AS year,
        CAST(EXTRACT(WEEK FROM d) AS SMALLINT) AS week_of_year,
        CAST(EXTRACT(ISODOW FROM d) AS SMALLINT) AS day_of_week,
        CASE WHEN EXTRACT(ISODOW FROM d) IN (6, 7) THEN TRUE ELSE FALSE END AS is_weekend
    FROM date_spine
    ON CONFLICT (date_key) DO NOTHING;
    """
    with conn.cursor() as cursor:
        try:
            cursor.execute(seed_sql)
            conn.commit()
            logger.info("Successfully seeded dim_date.")
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to seed dim_date: {e}")
            raise e

def main():
    load_dotenv()
    logger.info("Starting Data Warehouse Setup...")
    
    # 1. Create database if it doesn't exist
    create_database_if_not_exists()
    
    # 2. Run DDL scripts in order
    ddl_files = [
        "sql/ddl/dim_date.sql",
        "sql/ddl/dim_user.sql",
        "sql/ddl/dim_product.sql",
        "sql/ddl/dim_device.sql",
        "sql/ddl/dim_location.sql",
        "sql/ddl/dim_channel.sql",
        "sql/ddl/fact_events.sql",
        "sql/ddl/fact_orders.sql",
        "sql/ddl/partitions.sql",
        "sql/ddl/etl_metadata.sql"
    ]
    
    try:
        with get_connection() as conn:
            for ddl_file in ddl_files:
                if os.path.exists(ddl_file):
                    run_ddl_file(conn, ddl_file)
                else:
                    logger.error(f"DDL file not found: {ddl_file}")
                    sys.exit(1)
            
            # 3. Seed dim_date
            seed_dim_date(conn)
            
        logger.info("Data Warehouse Setup completed successfully!")
    except Exception as e:
        logger.error(f"Data Warehouse Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
