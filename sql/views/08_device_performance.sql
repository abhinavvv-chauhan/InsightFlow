CREATE OR REPLACE VIEW device_performance AS
WITH sessions AS (
    SELECT device_key,
           COUNT(DISTINCT session_id) AS total_sessions
    FROM fact_events
    GROUP BY device_key
),
orders AS (
    SELECT device_key,
           COUNT(*) FILTER (WHERE payment_status = 'success') AS total_orders,
           SUM(order_amount) FILTER (WHERE payment_status = 'success') AS total_revenue
    FROM fact_orders
    GROUP BY device_key
)
SELECT d.device,
       d.os_family,
       d.is_mobile,
       COALESCE(s.total_sessions, 0) AS total_sessions,
       COALESCE(o.total_orders, 0) AS total_orders,
       COALESCE(o.total_revenue, 0) AS total_revenue,
       ROUND(100.0 * COALESCE(o.total_orders, 0) / NULLIF(s.total_sessions, 0), 2) AS conversion_rate_pct
FROM dim_device d
LEFT JOIN sessions s ON d.device_key = s.device_key
LEFT JOIN orders o ON d.device_key = o.device_key
ORDER BY total_revenue DESC NULLS LAST;
