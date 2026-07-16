import pandas as pd
from utils.db import execute_query

def perform_rca(metric="revenue", dimension="device"):
    """
    Simulates the RCA algorithm from the SDD. 
    Finds the largest negative contributor to a metric's week-over-week change.
    """
    # For demonstration, we'll find which device had the biggest revenue drop in the last two weeks.
    sql = """
    WITH weekly AS (
        SELECT d.device,
               DATE_TRUNC('week', o.date_key::TEXT::DATE) AS activity_week,
               SUM(o.order_amount) FILTER (WHERE o.payment_status = 'success') AS rev
        FROM fact_orders o
        JOIN dim_device d ON o.device_key = d.device_key
        GROUP BY 1, 2
    ),
    deltas AS (
        SELECT device,
               activity_week,
               rev,
               LAG(rev) OVER (PARTITION BY device ORDER BY activity_week) AS prev_rev
        FROM weekly
    )
    SELECT device, activity_week, 
           COALESCE(rev, 0) AS current_rev, 
           COALESCE(prev_rev, 0) AS previous_rev,
           COALESCE(rev, 0) - COALESCE(prev_rev, 0) AS delta
    FROM deltas
    WHERE prev_rev IS NOT NULL
    ORDER BY delta ASC
    """
    rows = execute_query(sql)
    if not rows:
        return {"status": "insufficient_data", "insight": "Not enough historical data for RCA."}
        
    df = pd.DataFrame(rows)
    # Get the row with the biggest negative delta
    worst = df.iloc[0]
    
    if worst['delta'] >= 0:
        return {"status": "no_drop", "insight": "No negative drivers found for the selected metric."}
        
    insight = f"The largest drop in {metric} was driven by '{worst['device']}' devices during the week of {worst['activity_week'].date()}, dropping by {-worst['delta']}."
    
    return {
        "status": "anomaly_detected",
        "dimension": dimension,
        "worst_member": worst['device'],
        "delta": float(worst['delta']),
        "insight": insight
    }
