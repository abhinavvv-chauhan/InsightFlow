CREATE OR REPLACE VIEW city_performance AS
WITH sessions AS (
    SELECT location_key,
           COUNT(DISTINCT session_id) AS total_sessions
    FROM fact_events
    GROUP BY location_key
),
orders AS (
    SELECT location_key,
           COUNT(*) FILTER (WHERE payment_status = 'success') AS total_orders,
           SUM(order_amount) FILTER (WHERE payment_status = 'success') AS total_revenue
    FROM fact_orders
    GROUP BY location_key
)
SELECT l.city,
       l.tier,
       l.country,
       COALESCE(s.total_sessions, 0) AS total_sessions,
       COALESCE(o.total_orders, 0) AS total_orders,
       COALESCE(o.total_revenue, 0) AS total_revenue,
       ROUND(100.0 * COALESCE(o.total_orders, 0) / NULLIF(s.total_sessions, 0), 2) AS conversion_rate_pct
FROM dim_location l
LEFT JOIN sessions s ON l.location_key = s.location_key
LEFT JOIN orders o ON l.location_key = o.location_key
ORDER BY total_revenue DESC NULLS LAST;
