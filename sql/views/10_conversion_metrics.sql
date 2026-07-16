CREATE OR REPLACE VIEW conversion_metrics AS
WITH funnel AS (
    SELECT session_id,
           MAX(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS reached_landing,
           MAX(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END) AS reached_product,
           MAX(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS reached_cart,
           MAX(CASE WHEN event_type = 'checkout' THEN 1 ELSE 0 END) AS reached_checkout,
           MAX(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) AS reached_purchase
    FROM fact_events
    GROUP BY session_id
)
SELECT 
    SUM(reached_landing) AS landing_sessions,
    SUM(reached_product) AS product_view_sessions,
    SUM(reached_cart) AS cart_sessions,
    SUM(reached_checkout) AS checkout_sessions,
    SUM(reached_purchase) AS purchase_sessions,
    ROUND(100.0 * SUM(reached_purchase) / NULLIF(SUM(reached_landing), 0), 2) AS overall_conversion_pct
FROM funnel;
