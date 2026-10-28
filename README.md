# Buyora

A responsive Sri Lankan online shop using **Next.js, JavaScript, Spring Boot and PostgreSQL**, with prices in **LKR**.

## Features

- Browse photographed products by category; search, sort and filter by price, stock and options.
- Save favourites and manage a guest or signed-in cart.
- Check out with delivery details, optional coupons and cash on delivery. PayHere sandbox payments are available when configured.
- View orders, shipment details and eligible return/refund requests.
- Register, sign in immediately, manage profile and addresses.
- Administrators manage products, images, variants, stock, orders, reviews and store settings.

## Screenshots

<p>
  <a href="docs/screenshots/desktop-home.png"><img src="docs/screenshots/desktop-home.png" alt="Buyora desktop storefront" width="74%" /></a>
  <a href="docs/screenshots/mobile-home.png"><img src="docs/screenshots/mobile-home.png" alt="Buyora mobile storefront" width="21%" /></a>
</p>

[Desktop and mobile gallery](docs/screenshots/README.md). Images use sample products and example LKR prices.

## Run locally

Start Docker Desktop with Linux containers. Run commands from the repository root.

1. Copy `.env.example` to `.env` **only if it does not already exist**.
2. Set `POSTGRES_PASSWORD` and `JWT_SECRET` to separate strong random values. Never commit `.env`.
3. Start the application:

~~~powershell
docker compose -p buyora up -d --build --wait
~~~

Use the same project name for future updates to preserve the existing database volume. If port 3000 is occupied, set `FRONTEND_PORT` to an unused port in `.env` and rebuild; the website then uses that port. Default addresses: **http://localhost:3000** (website) and **http://localhost:8080** (API). When `BACKEND_PORT=8081`, the API uses port 8081. Rebuild the frontend after changing public ports, and use `localhost` consistently for authentication. When the app URL uses `localhost`, opening the website through `127.0.0.1` redirects to that address and preserves the page and filters, so browser API calls and cookies use the same hostname.

Generate each secret separately in PowerShell:

~~~powershell
$bytes = New-Object byte[] 64
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$random.GetBytes($bytes)
$random.Dispose()
[BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
~~~

Docker runs three services: the website, the API and PostgreSQL. Builds run unit tests. PostgreSQL stores the shop data and supplies catalog queries directly. The backend limits repeated requests.

Register through the website, then sign in with the same email and password. There is no default admin account or password. To promote your own local account:

~~~powershell
docker compose -p buyora exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
~~~

Replace the example address with your registered email:

~~~sql
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'your-email@example.com' AND r.name = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;
~~~

Sign in again and open `/admin`. Account screens use the signed-in user's name. New databases have an empty catalog; [optional sample products](docs/SAMPLE_CATALOG.md) range from LKR 200 to LKR 329,000.

~~~powershell
docker compose -p buyora ps
docker compose -p buyora logs -f backend
docker compose -p buyora down
~~~

Normal `down` preserves the database. Do not remove volumes to fix startup or migration errors. This local setup is not a public production deployment configuration.

## Main folders

| Folder | Responsibility |
|---|---|
| `BuyoraFrontend/src/app` | Store, account and admin pages |
| `BuyoraFrontend/src/components` | Shared forms, navigation and product UI |
| `BuyoraFrontend/src/services` | HTTP calls to the API |
| `BuyoraFrontend/src/hooks` | Reusable account, cart and wishlist hooks |
| `BuyoraFrontend/src/lib` | API client, validation and formatting helpers |
| `BuyoraFrontend/src/test` | Frontend unit and component tests |
| `BuyoraBackend/src/main/java/com/buyora/api` | Business modules: auth, products, cart, checkout and orders |
| `BuyoraBackend/src/main/resources/db/migration` | One initial migration for the store database |
| `BuyoraBackend/src/test` | Business-rule, security and integration tests |
| `scripts` | Optional sample data and screenshot tools |

Each backend feature keeps its files together in one folder. For example, `cart/` contains `CartController.java` for HTTP requests, `CartService.java` for business rules, repositories for database access and request/response classes. Entities represent stored records. Shared security, configuration and error handling live in `common/`.

Services are ordinary classes. Mapper classes copy entity fields into safe response objects using explicit Java methods. Frontend service files make API requests, hooks load and update data, and components display it. Next.js page folders follow the website URLs.

## Application flow

1. Next.js renders pages; client forms call JavaScript service functions and Spring API controllers.
2. Cart services validate products and quantities against current stock. Prices come from the server.
3. Checkout validates address/delivery, reserves stock, calculates totals with `BigDecimal`, and saves the order in one transaction.
4. An idempotency key prevents duplicate orders. Item and address snapshots preserve historical order details.
5. Cash-on-delivery orders enter processing. Configured PayHere payments use signed callbacks; uncertain outcomes keep stock reserved for review.
6. Administrators fulfil orders and process eligible returns. Revenue changes only after confirmed refunds. Customers view order status and tracking in the website.

Cash on delivery demonstrates the full shopping flow without merchant credentials. PayHere requires sandbox credentials and callback testing before use.

## Security and database

The application uses password hashing, HTTP-only authentication cookies, CSRF, validation, role checks and order ownership checks. Variants referenced by orders are archived rather than deleted. Signed-in users can change their password by providing the current password. Password recovery is unavailable in this version.

Flyway creates the database with `V1__create_store.sql`. This project starts with a new database. After setup, keep applied migrations unchanged and retain the database volume when updating the application.

## Checks

[Practical audit results and verification limits](docs/AUDIT.md).

Frontend development needs Node.js 22 or later:

The frontend uses JavaScript (`.js`) and React JSX (`.jsx`). Configuration files use `.mjs`; `jsconfig.json` defines the `@/` folder shortcut. Runtime form validation and backend validation remain in place.

~~~powershell
cd BuyoraFrontend
npm ci
npm run lint
npm run test:run
npm run build
~~~

Backend development needs Java 21 or later. Keep Docker running: integration tests use separate disposable PostgreSQL containers.

~~~powershell
cd BuyoraBackend
.\mvnw.cmd clean verify
~~~

Tests cover authentication/CSRF, stock, pricing, payment callbacks, refunds, checkout totals, duplicate submissions, ownership and rollback.

Browser checks need the running local app and the [sample catalog](docs/SAMPLE_CATALOG.md), including its category photographs:

~~~powershell
cd BuyoraFrontend
$env:PLAYWRIGHT_EXTERNAL_SERVER = 'true'
# When using a different website port:
# $env:PLAYWRIGHT_BASE_URL = 'http://localhost:3015'
npx playwright install chromium --only-shell
npm run test:e2e
~~~

Refresh screenshots with `node scripts/capture-portfolio.cjs` from the repository root. Test output stays in ignored build/test folders.
