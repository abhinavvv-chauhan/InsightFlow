CREATE MATERIALIZED VIEW IF NOT EXISTS daily_kpis AS
WITH sessions AS (
    SELECT d.full_date, COUNT(DISTINCT session_id) AS sessions,
           COUNT(DISTINCT user_key) AS dau
    FROM fact_events f JOIN dim_date d ON d.date_key = f.date_key
    GROUP BY d.full_date
),
purchases AS (
    SELECT d.full_date,
           COUNT(*) FILTER (WHERE o.payment_status='success')            AS orders,
           SUM(o.order_amount) FILTER (WHERE o.payment_status='success') AS revenue,
           COUNT(DISTINCT o.user_key) FILTER (WHERE o.payment_status='success') AS buyers
    FROM fact_orders o JOIN dim_date d ON d.date_key = o.date_key
    GROUP BY d.full_date
)
SELECT s.full_date, s.sessions, s.dau,
       COALESCE(p.orders,0)  AS orders,
       COALESCE(p.revenue,0) AS revenue,
       ROUND(COALESCE(p.revenue,0)/NULLIF(p.orders,0),2)   AS aov,
       ROUND(100.0*COALESCE(p.orders,0)/NULLIF(s.sessions,0),2) AS conversion_pct
FROM sessions s LEFT JOIN purchases p ON p.full_date = s.full_date;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_kpis_date ON daily_kpis(full_date);
