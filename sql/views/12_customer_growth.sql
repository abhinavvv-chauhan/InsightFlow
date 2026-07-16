CREATE OR REPLACE VIEW customer_growth AS
WITH monthly_users AS (
    SELECT DATE_TRUNC('month', d.full_date) AS activity_month,
           u.user_type,
           COUNT(DISTINCT o.user_key) AS active_users
    FROM fact_orders o
    JOIN dim_date d ON o.date_key = d.date_key
    JOIN dim_user u ON o.user_key = u.user_key
    WHERE o.payment_status = 'success'
    GROUP BY DATE_TRUNC('month', d.full_date), u.user_type
)
SELECT activity_month,
       SUM(active_users) FILTER (WHERE user_type = 'new') AS new_users,
       SUM(active_users) FILTER (WHERE user_type = 'returning') AS returning_users,
       SUM(active_users) AS total_users
FROM monthly_users
GROUP BY activity_month
ORDER BY activity_month;
