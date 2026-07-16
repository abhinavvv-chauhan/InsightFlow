import pandas as pd
from utils.db import execute_query

def get_executive_kpis():
    """
    Fetches the top-level KPIs from the most recent day.
    """
    rows = execute_query("""
        SELECT 
            full_date,
            revenue,
            orders,
            dau,
            conversion_pct,
            aov
        FROM daily_kpis
        ORDER BY full_date DESC
        LIMIT 1
    """)
    
    if not rows:
        return {}
        
    return dict(rows[0])

def get_revenue_trend():
    """
    Fetches the revenue trend with moving averages.
    """
    rows = execute_query("SELECT * FROM revenue_trend ORDER BY full_date")
    return pd.DataFrame(rows)

def get_product_leaderboard(limit=10):
    """
    Fetches top products.
    """
    rows = execute_query("SELECT * FROM product_performance ORDER BY revenue DESC LIMIT %s", (limit,))
    return pd.DataFrame(rows)
