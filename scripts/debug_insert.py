import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.db import get_connection
import psycopg2.extras

def test_insert():
    row = (20260705, 7001, 351.0, 85, 36, 71, 'sess_57d8c1bf', 'payment', '2026-07-05 17:12:00+00:00')
    
    with get_connection() as conn:
        with conn.cursor() as cur:
            try:
                psycopg2.extras.execute_values(cur, """
                    INSERT INTO fact_events (date_key, user_key, product_key, device_key, location_key, channel_key, session_id, event_type, event_ts)
                    VALUES %s
                """, [row])
                print("Insert succeeded!")
            except Exception as e:
                print(f"Insert failed: {e}")
                
if __name__ == "__main__":
    test_insert()
