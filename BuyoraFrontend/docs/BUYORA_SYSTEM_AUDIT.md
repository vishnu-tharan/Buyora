# Buyora system audit — 27 September 2026

Developer: Vishnu

## Acceptance status

**Production acceptance remains open.** Code compilation and focused regression checks are not evidence that payment, database migrations, SMTP or storage work in a deployed environment. Earlier claims of successful migrations and complete integration have been removed because they were not supported by the available test results.

## Structure and cleanup

The root contains BuyoraFrontend and BuyoraBackend. Application dependencies, configuration, tests and documentation remain inside their corresponding application folder. Removed 42 obsolete generator scripts, extraction artifacts and an obsolete instruction alias after checking runtime references. Preserved configuration templates, dependency locks, required framework files and legal notices. Removed unused axios and cookie-helper dependencies. Application sources no longer use TypeScript no-check directives.

## Repairs

| Area | Changes |
| --- | --- |
| Authentication | Server-validated identity; memory-only frontend role state; safe return paths; cookie/CSRF handling; current user status checks; refresh-token revocation on password changes; functional email verification/reset delivery |
| Object ownership | Orders and payments require the actual user or matching guest-cart cookie; removed hardcoded and nullable identity bypasses |
| Checkout | Actual cart and server totals; configured delivery/payment methods; owned idempotent order creation; failures remain visible; duplicate submission guard |
| Inventory | Locked updates, positive quantities, stock/reservation bounds and idempotent inventory ledger transitions |
| Payments | PayHere signature, merchant, amount and currency verification; owned payment initiation/status; confirmed webhook updates; callback never trusts URL success |
| Catalog | Actual variants, stock, prices, brands, categories, filters and pagination; plain-text descriptions; safe structured data; trusted image hosts |
| Accounts | Address public identifiers/default flags, actual review history, cancellation/return contracts and status timeline |
| Reviews | Pending moderation for new reviews; approved-only public listing and aggregates; verified-purchase check against delivered orders; admin approve/reject |
| Administration | Paged lists, product detail/create/metadata editing, taxonomy creation, inventory adjustments, order progression, coupon create/deactivate, customer detail and paid-sales reporting |
| UI behavior | Removed misleading controls, visible API errors, guest wishlist lookup, valid brand links, accessible product actions, real toast provider and terms checkbox binding |
| Operations | Bounded per-process rate limiter; safe errors; localhost-only development ports; required Compose signing secret; correct JVM entrypoint |

## Remaining work and release gates

1. Run the full Testcontainers suite with Docker, then apply migrations to an isolated PostgreSQL copy. V9 adds stock constraints and may reject inconsistent historical inventory. Reconcile data before deployment; do not disable constraints to force migration.
2. Run customer and administrator journeys against a real seeded backend: registration/verification/login, guest and customer carts, concurrent checkout, coupon exhaustion, every shipping/payment choice, cancellations, moderation and administrative stock changes.
3. Complete PayHere sandbox and provider reconciliation tests. Durable webhook auditing, provider transaction identifiers, chargebacks, refunds and reconciliation are not complete. Stripe is not offered as a working checkout method.
4. Implement safe expiry/reconciliation of abandoned online-payment reservations. Releasing stock solely on a timer without checking provider settlement can oversell when a late success arrives; this remains a launch blocker for online payments.
5. Test SMTP and object storage. Mail is asynchronous without a durable outbox/retry worker. Product administration currently supports one initial variant and metadata editing; advanced variant attributes, image management and complete operational workflows require further work.
6. Refresh-token rotation and immediate access-token invalidation remain open. Existing access tokens can survive logout/password change until their configured expiry. The rate limiter is per process; distributed deployment needs shared or edge enforcement.
7. Confirm return/refund business policy. Returns accept whole orders only and enforce the configured delivery-based window. Refund completion requires actual provider processing and cannot be marked successful through a placeholder status update.
8. Complete category descendant/attribute filtering, admin search/filter coverage, authenticated wishlist merging and large-catalog performance work. Some catalog/customer mappings still perform additional per-row queries. No load-test or performance claim is made.
9. Configure production TLS, trusted media hosts, cookie/origin behavior, secrets, backups, monitoring and a content security policy. Run restore and deployment smoke tests. Development Compose credentials and mutable image tags are not a production deployment configuration.

## Evidence

See BUYORA_TEST_MATRIX.md for actual checks and their limitations. No deployment, live charge, refund or message to a real customer was performed as part of verification.
