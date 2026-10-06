# Deployment guide

For local Docker setup, use the root [Docker guide](../../docs/DOCKER_SETUP.md). Production acceptance is separate. The Dockerfile runs unit tests during packaging; run ./mvnw verify with Docker for the database integration tests before image publication.

Use the prod profile, PostgreSQL, authenticated Redis with the appropriate TLS setting, real SMTP and trusted object storage. Configure DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, REDIS_HOST, REDIS_PASSWORD, JWT_SECRET, CORS_ALLOWED_ORIGINS, FRONTEND_URL, API_URL and the storage/mail variables from .env.example. PayHere uses PAYHERE_MERCHANT_ID, PAYHERE_MERCHANT_SECRET, PAYHERE_SANDBOX and PAYHERE_PAYMENT_URL. Keep signing/payment credentials exclusively on the server.

Use HTTPS with Secure cookies. Verify SameSite behavior across the actual storefront/API/provider return origins. Configure a reverse proxy, restricted service ports, request limits, secret rotation, backups and health monitoring. Do not deploy the development Compose credentials unchanged. Pin tested container versions or digests.

Media upload currently has no backend implementation. Implement and test storage before adding a bucket or exposing uploads. Test production SMTP delivery and a PayHere sandbox callback through a reachable HTTPS URL. Reconcile historical inventory before Flyway upgrades and rehearse database recovery. Online reservation expiry, refunds and reconciliation remain launch blockers; see the system audit in BuyoraFrontend/docs.

No production deployment or rollback rehearsal was performed in this audit.
