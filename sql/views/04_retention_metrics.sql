CREATE OR REPLACE VIEW retention_metrics AS
WITH first_month AS (
    SELECT u.user_key,
           DATE_TRUNC('month', d.full_date) AS cohort_month
    FROM dim_user u JOIN dim_date d ON d.date_key = u.first_seen_date_key
),
activity AS (
    SELECT DISTINCT o.user_key,
           DATE_TRUNC('month', d.full_date) AS active_month
    FROM fact_orders o JOIN dim_date d ON d.date_key = o.date_key
    WHERE o.payment_status = 'success'
)
SELECT fm.cohort_month,
       (EXTRACT(YEAR FROM a.active_month)*12 + EXTRACT(MONTH FROM a.active_month))
     - (EXTRACT(YEAR FROM fm.cohort_month)*12 + EXTRACT(MONTH FROM fm.cohort_month))
       AS month_offset,
       COUNT(DISTINCT a.user_key) AS active_users
FROM first_month fm
JOIN activity a ON a.user_key = fm.user_key
GROUP BY 1, 2;
