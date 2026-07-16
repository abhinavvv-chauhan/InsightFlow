import pandas as pd
from utils.db import execute_query

def get_retention_heatmap():
    """
    Fetches retention metrics and pivots them into a heatmap matrix.
    Rows = Cohort, Columns = Month Offset, Values = Retention %
    """
    rows = execute_query("""
        WITH cohort_sizes AS (
            SELECT cohort_month, MAX(active_users) as cohort_size
            FROM retention_metrics
            WHERE month_offset = 0
            GROUP BY cohort_month
        )
        SELECT r.cohort_month, r.month_offset, r.active_users, c.cohort_size
        FROM retention_metrics r
        JOIN cohort_sizes c ON r.cohort_month = c.cohort_month
        ORDER BY r.cohort_month, r.month_offset
    """)
    
    if not rows:
        return pd.DataFrame()
        
    df = pd.DataFrame(rows)
    df['cohort_month_str'] = df['cohort_month'].dt.strftime('%b %Y')
    df['retention_pct'] = (df['active_users'] / df['cohort_size']) * 100
    
    heatmap = df.pivot(index='cohort_month_str', columns='month_offset', values='retention_pct')
    heatmap = heatmap.round(1)
    
    # Sort index chronologically
    heatmap.index = pd.CategoricalIndex(heatmap.index, categories=df['cohort_month_str'].unique(), ordered=True)
    heatmap = heatmap.sort_index()
    
    # Rename columns to M0, M1, M2...
    heatmap.columns = [f"M{int(col)}" for col in heatmap.columns]
    
    return heatmap
