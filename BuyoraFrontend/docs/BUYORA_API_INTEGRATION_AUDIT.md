# Buyora integration audit

See [API contracts](API_INTEGRATION.md) and [system audit](BUYORA_SYSTEM_AUDIT.md).

Static contract fixes cover user identity, addresses, carts, order placement, inventory adjustment, order status bodies, reviews, taxonomy, coupons and payment ownership. Frontend typechecking and backend compilation verify internal consistency, not wire-level compatibility of every route.

Live acceptance must include cookies/CSRF through the intended production origins, ownership failures (401/403), missing records, validation failures, duplicate checkout/webhooks, declined/pending payments and storage/SMTP outages. Database-backed tests are blocked by the missing Docker environment. No complete customer-to-database or administrator-to-customer acceptance claim is made.
