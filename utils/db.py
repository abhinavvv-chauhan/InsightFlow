import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from dotenv import load_dotenv
from utils.logger import setup_logger

load_dotenv()
logger = setup_logger("insightflow.db")

PG_DSN = os.getenv("PG_DSN", "postgresql://postgres:postgres@localhost:5432/postgres")

@contextmanager
def get_connection():
    conn = None
    try:
        conn = psycopg2.connect(PG_DSN)
        yield conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise e
    finally:
        if conn:
            conn.close()

@contextmanager
def get_cursor(commit=False):
    with get_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception as e:
            if commit:
                conn.rollback()
            logger.error(f"Database cursor error: {e}")
            raise e
        finally:
            cursor.close()

def execute_statement(sql: str, params=None, commit=True):
    """Executes a DDL or modification statement."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            try:
                cursor.execute(sql, params)
                if commit:
                    conn.commit()
            except Exception as e:
                conn.rollback()
                logger.error(f"Failed executing statement: {e}\nSQL: {sql}")
                raise e

def execute_query(sql: str, params=None):
    """Executes a SELECT query and returns the rows as dictionaries."""
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            try:
                cursor.execute(sql, params)
                return cursor.fetchall()
            except Exception as e:
                logger.error(f"Failed executing query: {e}\nSQL: {sql}")
                raise e

@contextmanager
def transaction():
    """Context manager for running a set of operations in a transaction."""
    with get_connection() as conn:
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Transaction failed, rolled back: {e}")
            raise e
