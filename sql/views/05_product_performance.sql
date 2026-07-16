CREATE OR REPLACE VIEW product_performance AS
WITH views AS (
    SELECT product_key, COUNT(*) AS view_cnt
    FROM fact_events WHERE event_type = 'product_view'
    GROUP BY product_key
),
buys AS (
    SELECT product_key,
           COUNT(*) AS order_cnt,
           SUM(order_amount) FILTER (WHERE payment_status='success') AS revenue
    FROM fact_orders GROUP BY product_key
)
SELECT p.product_key, p.product_name, p.category,
       COALESCE(v.view_cnt,0)  AS product_views,
       COALESCE(b.order_cnt,0) AS orders,
       COALESCE(b.revenue,0)   AS revenue,
       ROUND(100.0 * COALESCE(b.order_cnt,0)
             / NULLIF(v.view_cnt,0), 2) AS view_to_buy_pct,
       RANK()       OVER (ORDER BY COALESCE(b.revenue,0) DESC) AS revenue_rank,
       DENSE_RANK() OVER (PARTITION BY p.category
                          ORDER BY COALESCE(b.revenue,0) DESC) AS category_revenue_rank
FROM dim_product p
LEFT JOIN views v ON v.product_key = p.product_key
LEFT JOIN buys  b ON b.product_key = p.product_key;
