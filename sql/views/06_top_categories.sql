CREATE OR REPLACE VIEW top_categories AS
SELECT category,
       COUNT(*) AS total_orders,
       SUM(order_amount) FILTER (WHERE payment_status = 'success') AS revenue,
       RANK() OVER (ORDER BY SUM(order_amount) FILTER (WHERE payment_status = 'success') DESC NULLS LAST) AS category_rank
FROM fact_orders o
JOIN dim_product p ON o.product_key = p.product_key
GROUP BY category
ORDER BY revenue DESC NULLS LAST;
