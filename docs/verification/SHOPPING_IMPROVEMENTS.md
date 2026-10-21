# Shopping and design improvements — 6 October 2026

Implemented in the existing Buyora project. Existing working changes were retained; nothing was deployed, charged, refunded, or emailed to a real customer.

## Customer experience

- Warm ivory, deep teal, and peach visual system; consistent Lucide icons, updated header/footer, category tiles, product spotlight, and clearer product cards.
- Responsive mobile navigation, product image swipe/zoom, variant availability, and a fixed mobile purchase control.
- Keyboard search suggestions, search synonyms/fuzzy matching, category descendants, and variant attribute filters with removable filter chips.
- Up to four products compared side by side; shareable comparison links.
- Signed-in stock and price alerts, local recently viewed items refreshed against the current catalog, and guest wishlist merging after sign-in.
- Optional complementary product bundles and uploaded MP4 demonstrations.
- District delivery estimates and COD eligibility derived from store settings. Checkout retains guest access and automatic contact/address completion fields.
- Contact, FAQ, delivery, returns, privacy, and terms pages; optional WhatsApp link from actual configured contact details.
- Authorized order tracking, partial return requests, and visible refund progress.
- Delivered-purchase review photo uploads; customer photos remain private until review moderation approves them.
- Consent-controlled aggregate shopping counts, including separate order-placed and paid-purchase events.
- Paginated product sitemaps and corrected metadata/images.

## Store administration and reliability

Product presentation editing includes variant creation/archiving, SKU/prices/options, photo upload/primary image/variant association, specifications, merchandising flags, video, and complements. Inventory remains separately managed.

Store settings persist business contact details, delivery/return windows, and COD districts. Tracking references can be saved after shipment. Returns support approval, receipt, refund initiation, and evidence-based reconciliation.

Email is stored in a durable outbox, retried with backoff, and exposed in Operations. Successfully delivered message bodies are erased. SMTP delivery is at-least-once: a crash immediately after sending can result in a duplicate.

PayHere merchant retrieval and refund support is disabled by default. Initiated uncertain payments retain reserved stock and enter a review queue. Uninitiated expired orders release stock. Accepted PayHere refunds remain REQUESTED; a full refund can be confirmed from provider retrieval. Partial refunds and ambiguous outcomes require an operator to verify the exact reference and amount. Refund requests are not automatically retried after timeouts. Delayed payments after cancellation are flagged for review rather than automatically fulfilling an order.

V13 is an additive Flyway migration for the new data tables, tracking/video fields, and refund states. Historical refunded returns are included in confirmed-refund totals.

## Verified in this session

| Check | Result |
|---|---|
| Frontend TypeScript and ESLint | Passed |
| Frontend tests | 12 files, 70 tests passed |
| Production Next.js build | Passed; 41 static pages generated, dynamic routes compiled |
| Backend tests | 36 unit tests and 8 PostgreSQL integration tests passed; includes V13 schema, auth, refund safeguards and payment callbacks |
| Docker build and startup | Both application images rebuilt; all five services healthy; V13 applied to the existing database |
| Retained data | Existing database volume preserved; user, product, order and order-item counts unchanged |
| Browser checks | Desktop/mobile storefront, variant stock/pricing, delivery quote, image zoom/navigation, comparison table, attribute filters, keyboard search, product editor, and settings |
| Whitespace check | Passed |

The original design checks used the isolated local fixture in `BuyoraFrontend/e2e/fixtures/catalog-api.mjs`. It uses sample catalog data and an artificial local user; it is **not** an authentication, database, payment, or email integration test. Screenshots show the new layout with fixture/placeholder imagery:

- [Desktop screenshot](storefront-desktop.jpg)
- [Mobile screenshot](storefront-mobile.jpg)
- [Normal configuration preview](storefront-preview.jpg) (backend unavailable; the hero uses its designed fallback)

## Before launch

1. The full backend `verify` suite, Docker builds and V13 migration now pass. See [Docker update verification](DOCKER_UPDATE.md) for the October 6 results. The September runtime.json remains an older, separate report. Complete the remaining business-flow checks below before public release.
2. Verify catalog editing and upload permissions, guest/account checkout, stock reservation, partial returns, refund accounting, and email retries against a real test database.
3. Configure real business contact details and review the published delivery, return, privacy, and terms content. Initial return and delivery values are configurable defaults, not an independently verified business policy.
4. Configure PayHere sandbox merchant/API credentials and callback connectivity. Test success, failure, delayed/duplicate callbacks, full/partial refunds, and unknown outcomes before enabling merchant operations. Late paid cancellations require an operator's provider/dashboard review.
5. Publish real product photographs and useful option/specification data. No sample products were inserted into the real store.
6. Media uploads are stored in PostgreSQL (5 MB images, 20 MB MP4). Include them in backup/capacity planning; larger catalogs should move media to dedicated storage. Video delivery currently streams complete files rather than byte-range segments.
7. Run browser checkout and accessibility/performance checks against the full test stack. No measured conversion improvement or Core Web Vitals result is claimed.

## Fixture preview

For a repeatable local interface check, start `node e2e/fixtures/catalog-api.mjs` inside BuyoraFrontend, then run Next with both `INTERNAL_API_URL` and `NEXT_PUBLIC_API_BASE_URL` set to `http://127.0.0.1:8091/api/v1`. Open `http://127.0.0.1:3000`. Stop both processes when finished and remove those process overrides before connecting to the real backend. Do not use this fixture for deployed hosting.

The rebuilt Docker storefront was also checked against the retained database: desktop catalog rendering, product detail, comparison and mobile navigation passed without browser runtime errors.
