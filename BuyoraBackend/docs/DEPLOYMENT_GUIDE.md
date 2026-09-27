# Deployment guide

Production acceptance is open. First run ./mvnw verify with Docker and resolve failures. The Dockerfile packages without rerunning tests, so a passing external test gate is required before image publication.

Use the prod profile, PostgreSQL, authenticated Redis with the appropriate TLS setting, real SMTP and trusted object storage. Configure DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, REDIS_HOST, REDIS_PASSWORD, JWT_SECRET, CORS_ALLOWED_ORIGINS, FRONTEND_URL, API_URL and the storage/mail variables from .env.example. PayHere uses PAYHERE_MERCHANT_ID, PAYHERE_MERCHANT_SECRET, PAYHERE_SANDBOX and PAYHERE_PAYMENT_URL. Keep signing/payment credentials exclusively on the server.

Use HTTPS with Secure cookies. Verify SameSite behavior across the actual storefront/API/provider return origins. Configure a reverse proxy, restricted service ports, request limits, secret rotation, backups and health monitoring. Do not deploy the development Compose credentials unchanged. Pin tested container versions or digests.

Create the media bucket and explicit access policy. Test SMTP verification/reset delivery and a PayHere sandbox callback through a reachable HTTPS URL. Reconcile historical inventory before Flyway upgrades and rehearse database recovery. Online reservation expiry, refunds and reconciliation remain launch blockers; see the system audit in BuyoraFrontend/docs.

No production deployment or rollback rehearsal was performed in this audit.
