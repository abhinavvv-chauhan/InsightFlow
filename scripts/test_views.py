import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.db import get_connection

def test_views():
    with get_connection() as conn:
        with conn.cursor() as cur:
            print("--- Testing daily_kpis ---")
            cur.execute("SELECT * FROM daily_kpis LIMIT 5")
            for row in cur.fetchall():
                print(row)
                
            print("\n--- Testing product_performance ---")
            cur.execute("SELECT * FROM product_performance LIMIT 5")
            for row in cur.fetchall():
                print(row)

            print("\n--- Testing retention_metrics ---")
            cur.execute("SELECT * FROM retention_metrics LIMIT 5")
            for row in cur.fetchall():
                print(row)

if __name__ == "__main__":
    test_views()
