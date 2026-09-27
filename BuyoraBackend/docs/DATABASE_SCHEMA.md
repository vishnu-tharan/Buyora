# Database and migrations

PostgreSQL is the source of truth. JPA uses schema validation; Flyway owns migration execution. The src/main/resources/db/migration directory is authoritative.

The schema covers users/roles, verification/reset tokens, categories/brands/products/variants, inventories and ledger, carts/coupons, orders/items/history, payments, reviews, wishlists, addresses and returns.

Audit migrations add stock constraints and ledger uniqueness (V9), guest-order ownership/idempotency (V10), and review moderation status/index (V11). Apply to a backup or isolated copy first. Review historical duplicates and inconsistent reservations before adding constraints.

Migration execution has not been verified on this audit machine because the required Docker/PostgreSQL environment is unavailable. Never describe compilation as proof of migration success.
