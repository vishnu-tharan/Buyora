# Buyora Backend

Developer: Vishnu

Spring Boot API with PostgreSQL, Redis, object storage and SMTP. Java 21 is the compilation target. The audit machine used Java 22 and Maven 3.9.9.

## Local setup

Copy .env.example to .env and replace JWT_SECRET with a fresh random value. Docker Compose reads .env; running Maven directly does not automatically load it. Set environment variables in your shell for a direct JVM run.

Run docker compose up --build from this directory for development services. The compose file uses development-only database and storage credentials and binds exposed ports to localhost. Create the configured media bucket and its intended read policy before testing uploads. MailHog is available at localhost:8025. The API is at localhost:8080; the frontend is started separately on localhost:3000.

Alternatively start postgres, redis, minio and mailhog with Compose, export matching environment variables, then run ./mvnw spring-boot:run (mvnw.cmd on Windows). Use DB_PASSWORD=buyora_dev_password to match the provided development Compose database.

## Verification

Run ./mvnw verify with Docker available for Testcontainers. Do not skip failing integration tests to approve deployment. Focused regression tests can run without Docker using -Dtest=CouponPricingTest,InventoryServiceTest,PaymentSecurityTest,PasswordHashTest,PayhereWebhookTest,EmailNotificationTest.

Deployment instructions and known gaps are in docs/DEPLOYMENT_GUIDE.md. No live deployment was performed during this audit.
