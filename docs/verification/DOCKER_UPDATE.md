# Local Docker update verification — 6 October 2026

The existing `buyora-docker-check` project was rebuilt and restarted from the updated source. Frontend, backend, PostgreSQL, Redis and Mailpit all report healthy. Both application containers use the newly built images.

A private PostgreSQL archive was created before updating. The existing `buyora-docker-check_postgres_data` volume was retained. V13 migrated successfully, and existing user, product, order and order-item counts remained unchanged. The development preview was stopped so the production Docker frontend can use port 3000.

| Check | Result |
|---|---|
| Frontend Docker build | Full ESLint check, 70 tests, TypeScript and production build passed |
| Backend Docker build | Java 21 package and 36 unit tests passed |
| Full backend verify | 36 unit tests and 8 PostgreSQL integration tests passed; no failures or skips |
| Database upgrade | V13 applied; Hibernate validation and backend startup passed |
| Public API | Health, catalog, facets, store info, Colombo delivery quote, category tree and brands returned successfully |
| Website routes | Home, health, contact, comparison, order tracking, robots and sitemap returned successfully |
| Real browser | Retained catalog, product detail, comparison and mobile menu passed; no runtime errors |

The build initially identified a CommonJS import in the local UI fixture. The fixture now uses an ES module and full linting remains enabled.

Open **http://localhost:3000**. For future updates, use the same project:

```powershell
docker compose -p buyora-docker-check up -d --build --wait
```

This updates the local app. No public deployment, real payment, refund or customer email was performed. PayHere merchant operations remain disabled by default. Full payment sandbox and customer/admin business-flow testing remain release requirements.
