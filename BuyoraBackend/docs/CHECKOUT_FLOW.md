# Checkout flow

The server resolves the authenticated user or validated guest-cart identity, locks the cart, checks product/variant availability, reads current prices and validates coupon eligibility. It validates the configured shipping and payment selection and snapshots the submitted shipping address and order items.

A stable idempotency key returns the same owned order for a retry. Clients must retain the key for uncertain retries and use a new key for a genuinely new order. Request-payload fingerprinting is not currently implemented.

Online orders reserve stock and remain pending payment. Verified successful PayHere notification marks payment paid and confirms reserved stock exactly once. Negative terminal notification releases stock and cancels the order. COD proceeds to processing and consumes stock while payment remains unconfirmed.

Provider reconciliation and safe abandoned-reservation expiry remain required before accepting online payments in production. A browser return URL is never payment evidence.
