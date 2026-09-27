# Buyora architecture

The Next.js frontend runs separately from the Spring Boot API. Controllers validate transport input; services implement ownership, pricing and transactional state changes; repositories access PostgreSQL. Redis provides selected catalog caches, object storage holds media and SMTP delivers account/order messages.

The modular packages include auth, user, product, category, brand, inventory, cart, coupon, checkout, order, payment, review, wishlist, returns and notification. Configuration is bound through BuyoraProperties and Spring profiles.

Order placement publishes an after-commit notification event. Mail dispatch is asynchronous but is not a durable outbox. Inventory and payment consistency rely on database transactions and row locks. Production reconciliation, retry and monitoring workflows remain incomplete; consult the audit before deployment.
