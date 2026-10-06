# Buyora Docker setup

Developer: Vishnu

## Architecture

One root docker-compose.yml runs five services on the default Compose network:

| Service | Image/build | Internal address | Host access |
| --- | --- | --- | --- |
| frontend | Node 22 multi-stage standalone Next.js build | frontend:3000 | localhost:3000 |
| backend | Java 21 multi-stage Spring Boot build | backend:8080 | localhost:8080 |
| postgres | PostgreSQL 16 Alpine | postgres:5432 | Internal only |
| redis | Redis 7 Alpine | redis:6379 | Internal only |
| mailpit | Mailpit 1.31.2 local inbox | mailpit:1025 (SMTP) | localhost:8025 (inbox) |

All published ports bind to 127.0.0.1. No container names or container IPs are fixed. PostgreSQL uses a named volume; Redis is a disposable cache and test emails are temporary. The application images run as non-root users. Logs are bounded and go to stdout/stderr. Backend and frontend health checks gate startup; application restart retries are limited so failures stay visible.

MinIO is absent from the local stack. Product images, videos and review photos use validated uploads stored in PostgreSQL. Review photos remain private until approved. Existing public HTTPS image URLs require their host in IMAGE_HOSTS. Local fallback images are served by Next.js.

## First run

Start Docker Desktop in Linux-container mode. Open the repository root (the folder containing this document's parent docs directory).

~~~powershell
Copy-Item .env.example .env
~~~

Set POSTGRES_PASSWORD and JWT_SECRET to separate strong random values. On Windows PowerShell, the following initializes both blank entries without printing them:

~~~powershell
$settings = Get-Content .env -Raw
foreach ($key in @('POSTGRES_PASSWORD', 'JWT_SECRET')) {
    $bytes = New-Object byte[] 64
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $generator.GetBytes($bytes)
    $generator.Dispose()
    $value = [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
    $settings = $settings -replace ('(?m)^' + $key + '=\r?$'), ($key + '=' + $value)
}
[IO.File]::WriteAllText((Join-Path $PWD '.env'), $settings)
~~~

On Linux/macOS, copy with cp .env.example .env and generate each value using openssl rand -hex 64, then place the values in .env. Existing nonblank settings must be reviewed rather than overwritten. Never commit .env.

~~~sh
docker compose config --quiet
docker compose up -d --build
docker compose ps
~~~

The first build downloads dependencies. Frontend builds run lint and unit tests. Backend builds run unit tests during Maven package. Testcontainers integration tests run separately during Maven verify; no tests are silently disabled to pass the image build.

## URLs and environment

- Website: http://localhost:3000
- API health: http://localhost:8080/actuator/health
- API documentation: http://localhost:8080/swagger-ui.html
- Captured emails: http://localhost:8025

POSTGRES_DB and POSTGRES_USER configure database creation. POSTGRES_PASSWORD is shared between PostgreSQL and the backend. Changing it after a database volume has been initialized does not automatically change the existing database password.

FRONTEND_PORT, BACKEND_PORT and MAIL_UI_PORT change host ports. Rebuild the frontend when changing the first two: NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_APP_URL are build arguments embedded into the browser bundle. API_PUBLIC_URL must match the externally reachable API address for payment notification links. IMAGE_HOSTS is an optional comma-separated allowlist of public HTTPS media hosts and also requires a frontend rebuild.

Browser requests use http://localhost:<BACKEND_PORT>/api/v1. Server-rendered frontend requests use the runtime-only INTERNAL_API_URL=http://backend:8080/api/v1. The browser never receives backend as its API hostname. CORS permits the configured localhost frontend origin with credentials. The Docker Spring profile uses postgres and redis service names. Authentication and CSRF remain enabled; Secure cookies are disabled only for local HTTP.

Mailpit receives account and order emails locally; it does not send real customer emails. Optional PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET belong only in the backend environment. Cash on delivery works without provider credentials. PayHere callbacks cannot reach localhost from the internet; sandbox callback testing needs a deliberate HTTPS tunnel and matching API_PUBLIC_URL. No real payment is tested automatically.

## Accounts and local administrator setup

Register normally and verify the account using Mailpit. There is no seeded admin password. To promote your own verified local account, open psql:

~~~sh
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
~~~

Then execute the following with your account email, and sign in again:

~~~sql
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'your-local-account@example.com' AND r.name = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;
~~~

Use /admin to create categories/products and adjust stock. New databases contain no catalog products by default. Product editing includes image uploads, variants, specifications and merchandising options. Configure delivery, contact and policy details in admin settings before accepting orders.

## Updating the existing local stack

The current workspace uses the Compose project `buyora-docker-check` and its existing PostgreSQL volume. Update that same project with:

~~~powershell
docker compose -p buyora-docker-check up -d --build --wait
docker compose -p buyora-docker-check ps
~~~

Open http://localhost:3000. Use localhost consistently so browser requests and authentication cookies use the configured origin. The default commands below apply to a fresh `buyora` project; include `-p buyora-docker-check` when managing the existing workspace stack.

## Daily commands

~~~sh
docker compose logs -f
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f mailpit
docker compose build frontend
docker compose build backend
docker compose up -d --build frontend
docker compose restart
docker compose down
~~~

Normal down preserves the named PostgreSQL volume. **docker compose down -v permanently deletes that project's database volume.** Use it only for an intentional reset, never as a general fix for migration errors.

For a clean verification run without affecting the normal project's volumes, use a distinct project name and stop any stack occupying the same host ports:

~~~sh
docker compose -p buyora-docker-check build --no-cache
docker compose -p buyora-docker-check up -d --wait
docker compose -p buyora-docker-check ps
~~~

Only after confirming these are disposable test volumes, reset that test project with docker compose -p buyora-docker-check down -v. Existing volumes from the old backend-only Compose project are separate and are not automatically migrated or deleted.

## Backup and restore

A volume is not a backup. Create a PostgreSQL archive inside the container and copy it out, avoiding PowerShell binary-redirection problems:

~~~sh
docker compose exec postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/buyora.dump'
docker compose cp postgres:/tmp/buyora.dump ./buyora.dump
~~~

Store the archive privately outside Git. To restore, stop backend/frontend writes, copy the archive into PostgreSQL and restore into a separate empty database with pg_restore. Validate the restored database before replacing existing data. Backup/restore is not automatically performed during development startup.

## Troubleshooting

- Docker API unavailable: start Docker Desktop and verify docker info. Do not expose an unauthenticated Docker TCP socket.
- Old minio/minio pull error: run the root Compose file. The backend-only file has been removed; no default MinIO dependency remains.
- Backend connection refused: inspect backend/postgres logs. The JDBC hostname must be postgres, not localhost. Keep Flyway enabled.
- Migration or schema-validation error: inspect the reported SQL/entity mapping. Do not remove migration history or manually patch production data to hide it.
- Browser cannot call the API: confirm the browser URL uses localhost and CORS matches the frontend port. Rebuild after port/public-URL changes. Use localhost consistently rather than mixing it with 127.0.0.1.
- Server-side catalog request fails: check INTERNAL_API_URL and backend health from the frontend container.
- Port occupied: adjust the corresponding root .env port and rebuild the frontend as needed.
- Wrapper error on Windows: the official Maven wrapper is included; .gitattributes enforces LF for mvnw and the image normalizes shell line endings before execution.
- Docker 29 test compatibility: Testcontainers 1.21.4 replaces the old incompatible version. Run the full suite with BuyoraBackend/mvnw.cmd verify on Windows or ./mvnw verify from the backend folder on Unix.
- Empty storefront: create real catalog data using a local admin account; the setup does not fabricate sample products or claim an empty database contains products.

## Production changes

This is a local stack. Before deploying, use HTTPS, Secure cookies, explicit production origins, a production Spring profile, managed or secured database/cache/mail/storage, rotated secrets, backups, monitoring and tested provider callbacks. Reassess base-image vulnerabilities and pin approved digests. Resolve the application release gaps in BuyoraFrontend/docs/BUYORA_SYSTEM_AUDIT.md. Do not expose the test inbox publicly.

## Verification

Both updated application images and all five local services were verified on October 6, including V13 on the existing database and the full backend integration suite. See docs/verification/DOCKER_UPDATE.md and SHOPPING_IMPROVEMENTS.md for the checks and remaining release requirements. The older runtime.json describes the September Docker run. PayHere sandbox and the complete customer/admin business flows still require separate verification.
