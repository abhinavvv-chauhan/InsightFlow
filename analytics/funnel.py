import pandas as pd
from utils.db import execute_query

def get_funnel(filters=None):
    """
    Computes the purchase funnel.
    filters: dict of where clauses (e.g., {'device': 'Android'})
    """
    base_query = """
    WITH step_reached AS (
      SELECT f.session_id,
        MAX(CASE WHEN event_type='page_view'    THEN 1 ELSE 0 END) AS s1,
        MAX(CASE WHEN event_type='search'       THEN 1 ELSE 0 END) AS s2,
        MAX(CASE WHEN event_type='product_view' THEN 1 ELSE 0 END) AS s3,
        MAX(CASE WHEN event_type='add_to_cart'  THEN 1 ELSE 0 END) AS s4,
        MAX(CASE WHEN event_type='checkout'     THEN 1 ELSE 0 END) AS s5,
        MAX(CASE WHEN event_type='payment'      THEN 1 ELSE 0 END) AS s6,
        MAX(CASE WHEN event_type='purchase'     THEN 1 ELSE 0 END) AS s7
      FROM fact_events f
      {join_clause}
      {where_clause}
      GROUP BY f.session_id
    )
    SELECT COALESCE(SUM(s1),0) as landing, 
           COALESCE(SUM(s2),0) as search, 
           COALESCE(SUM(s3),0) as product_view,
           COALESCE(SUM(s4),0) as add_to_cart, 
           COALESCE(SUM(s5),0) as checkout, 
           COALESCE(SUM(s6),0) as payment, 
           COALESCE(SUM(s7),0) as purchase
    FROM step_reached;
    """
    
    where_parts = []
    join_clause = ""
    params = {}
    
    if filters:
        if 'device' in filters:
            join_clause += " JOIN dim_device d ON f.device_key = d.device_key "
            where_parts.append("d.device = %(device)s")
            params['device'] = filters['device']
        if 'city' in filters:
            join_clause += " JOIN dim_location l ON f.location_key = l.location_key "
            where_parts.append("l.city = %(city)s")
            params['city'] = filters['city']
            
    where_clause = "WHERE " + " AND ".join(where_parts) if where_parts else ""
    
    sql = base_query.format(join_clause=join_clause, where_clause=where_clause)
    rows = execute_query(sql, params)
    
    if not rows:
        return pd.DataFrame()
        
    counts = rows[0]
    steps = ['landing', 'search', 'product_view', 'add_to_cart', 'checkout', 'payment', 'purchase']
    
    data = []
    prev_count = None
    top_count = counts.get('landing', 0)
    
    for step in steps:
        count = counts.get(step, 0)
        conv_from_top = (count / top_count * 100) if top_count else 0
        drop_from_prev = (1 - (count / prev_count)) * 100 if prev_count and prev_count > 0 else 0
        
        data.append({
            'Step': step.replace('_', ' ').title(),
            'Sessions': count,
            'Conversion (%)': round(conv_from_top, 2),
            'Drop-off (%)': round(drop_from_prev, 2) if prev_count is not None else 0.0
        })
        prev_count = count
        
    return pd.DataFrame(data)
