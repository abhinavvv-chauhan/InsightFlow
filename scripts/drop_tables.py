import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.db import get_connection

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS fact_events CASCADE;")
        cur.execute("DROP TABLE IF EXISTS fact_orders CASCADE;")
    conn.commit()
print("Tables dropped successfully.")
