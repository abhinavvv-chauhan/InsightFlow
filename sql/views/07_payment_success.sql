CREATE OR REPLACE VIEW payment_success AS
SELECT payment_method,
       COUNT(*)                                              AS attempts,
       COUNT(*) FILTER (WHERE payment_status='success')      AS successes,
       ROUND(100.0 * COUNT(*) FILTER (WHERE payment_status='success')
             / NULLIF(COUNT(*),0), 2)                        AS success_rate_pct
FROM fact_orders
GROUP BY payment_method
ORDER BY success_rate_pct;
