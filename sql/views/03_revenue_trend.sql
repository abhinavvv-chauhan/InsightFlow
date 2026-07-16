CREATE OR REPLACE VIEW revenue_trend AS
WITH daily AS (
    SELECT d.full_date,
           SUM(o.order_amount) FILTER (WHERE o.payment_status = 'success') AS revenue
    FROM fact_orders o
    JOIN dim_date d ON d.date_key = o.date_key
    GROUP BY d.full_date
)
SELECT full_date,
       COALESCE(revenue, 0) AS revenue,
       AVG(COALESCE(revenue, 0)) OVER (ORDER BY full_date
             ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)  AS revenue_7d_moving_avg,
       SUM(COALESCE(revenue, 0)) OVER (ORDER BY full_date
             ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS revenue_30d_rolling,
       LAG(COALESCE(revenue, 0))  OVER (ORDER BY full_date)          AS prev_day_revenue,
       COALESCE(revenue, 0) - LAG(COALESCE(revenue, 0)) OVER (ORDER BY full_date) AS day_over_day_delta,
       CASE WHEN LAG(COALESCE(revenue, 0)) OVER (ORDER BY full_date) IS NULL THEN NULL
            ELSE ROUND(100.0 * (COALESCE(revenue, 0) - LAG(COALESCE(revenue, 0)) OVER (ORDER BY full_date))
                       / NULLIF(LAG(COALESCE(revenue, 0)) OVER (ORDER BY full_date),0), 2)
       END AS dod_growth_pct
FROM daily;
