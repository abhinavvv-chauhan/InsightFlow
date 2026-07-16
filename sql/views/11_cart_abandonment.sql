CREATE OR REPLACE VIEW cart_abandonment AS
WITH cart_sessions AS (
    SELECT session_id
    FROM fact_events
    WHERE event_type = 'add_to_cart'
    GROUP BY session_id
),
purchase_sessions AS (
    SELECT session_id
    FROM fact_events
    WHERE event_type = 'purchase'
    GROUP BY session_id
)
SELECT 
    COUNT(c.session_id) AS total_carts,
    COUNT(p.session_id) AS converted_carts,
    COUNT(c.session_id) - COUNT(p.session_id) AS abandoned_carts,
    ROUND(100.0 * (COUNT(c.session_id) - COUNT(p.session_id)) / NULLIF(COUNT(c.session_id), 0), 2) AS abandonment_rate_pct
FROM cart_sessions c
LEFT JOIN purchase_sessions p ON c.session_id = p.session_id;
