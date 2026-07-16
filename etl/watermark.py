from utils.db import get_connection

def get(table_name: str) -> str:
    """Returns the maximum timestamp successfully loaded."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT last_loaded_ts FROM etl_watermark WHERE table_name = %s;",
                (table_name,)
            )
            result = cur.fetchone()
            if result:
                return result[0].isoformat()
            return '1970-01-01T00:00:00+00:00'

def advance(tx_conn, table_name: str, max_ts: str) -> None:
    """Advances the watermark inside the transaction."""
    with tx_conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO etl_watermark (table_name, last_loaded_ts)
            VALUES (%s, %s)
            ON CONFLICT (table_name) DO UPDATE SET last_loaded_ts = EXCLUDED.last_loaded_ts;
            """,
            (table_name, max_ts)
        )
