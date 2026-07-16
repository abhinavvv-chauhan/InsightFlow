CREATE OR REPLACE VIEW weekly_kpis AS
SELECT DATE_TRUNC('week', full_date)::DATE AS week_start,
       SUM(sessions) AS total_sessions,
       SUM(dau) AS total_wau_rough, -- Note: true WAU requires distinct count over the week
       SUM(orders) AS total_orders,
       SUM(revenue) AS total_revenue,
       ROUND(SUM(revenue)/NULLIF(SUM(orders),0),2) AS aov,
       ROUND(100.0*SUM(orders)/NULLIF(SUM(sessions),0),2) AS conversion_pct
FROM daily_kpis
GROUP BY DATE_TRUNC('week', full_date)
ORDER BY week_start;
