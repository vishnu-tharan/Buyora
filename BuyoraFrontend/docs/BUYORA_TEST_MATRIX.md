# Buyora verification — 27 September 2026

Developer: Vishnu

| Check | Result | Scope and limits |
| --- | --- | --- |
| TypeScript | Passed | No type errors |
| ESLint | Passed | Zero errors and zero warnings |
| Next.js production build | Passed | Compilation and route generation; not live backend acceptance |
| Frontend unit tests | 68 passed / 12 files | Validation, formatting, UI helpers and API boundary handling |
| Browser suite | 56 passed | Edge engine, desktop and Pixel 7 viewport; navigation, auth forms, mobile search, accessibility smoke checks, cart failure, payment URL handling and admin pagination |
| Backend regression | 19 passed | Hashing, coupons, inventory, payment ownership/webhook validation and mail construction |
| Full backend verify | Failed: 19 passed, 2 errors | Testcontainers could not find Docker; no tests skipped |
| npm audit | Zero reported vulnerabilities | 858 dependencies in the final lockfile at audit time; not a guarantee of absence of vulnerabilities |
| Source attribution scan | No matching attribution text | Application source, documentation and project READMEs |
| Visual inspection | Mobile login checked | Labels, controls and layout visible without horizontal clipping |

Browser tests run against the production frontend. Selected API responses are intercepted for empty-cart, error and administrative scenarios; the backend was unavailable. These tests do not prove valid customer login, inventory concurrency, database migrations, payment settlement or administrator authorization at the server.

## Reproduce

From BuyoraFrontend: npm run typecheck; npm run lint; npm run test:run; npm run build. Start npm run start, then set PLAYWRIGHT_CHANNEL=msedge and PLAYWRIGHT_EXTERNAL_SERVER=true before npm run test:e2e on Windows. The semicolon-separated commands here describe separate checks, not a deployment gate; stop and investigate failures.

From BuyoraBackend: ./mvnw verify with Docker running. Focused tests may be run with -Dtest=CouponPricingTest,InventoryServiceTest,PaymentSecurityTest,PasswordHashTest,PayhereWebhookTest,EmailNotificationTest. They are not a replacement for the complete suite.

## Still required

Database migrations, server authentication/CSRF integration, guest identity continuity, concurrent last-item purchase, coupon exhaustion, PayHere sandbox settlement/duplicate/late callbacks, refunds, SMTP delivery, media upload, production origins/cookies, backup restore and load testing remain unverified. See BUYORA_SYSTEM_AUDIT.md for implementation gaps as well as environment-dependent checks.

## Saved evidence

Raw build, lint, unit, browser and dependency audit results are in docs/verification. Backend regression and full-suite logs are in BuyoraBackend/docs/verification. Browser screenshots are retained with the frontend evidence.
