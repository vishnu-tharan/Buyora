# Red storefront and photographed catalog — 12 October 2026

Shared brand colors now use a professional red palette across storefront, account, checkout and admin controls. Neutral surfaces and charcoal text keep the interface readable. Product categories, a photographic hero, current offers, category tabs, budget collections and visible purchase controls connect to the catalog.

The optional local sample catalog contains 24 photographed products in 8 categories. All default prices use LKR, with examples from LKR 200 to LKR 329,000. Exact minimum/maximum price inputs and budget collections cover inexpensive everyday items through premium electronics. Sample prices and stock are identified in the store notice; these are not verified supplier quotations or actual warehouse stock.

| Verification | Result |
|---|---|
| Frontend Docker build | Full lint, TypeScript, 70 tests and production build passed |
| Docker services | All five services healthy; rebuilt frontend running |
| Catalog import | 24 sample products; repeat import did not duplicate rows or reset stock |
| Existing data | Users, orders, original product IDs and original inventory quantities preserved |
| Photographs | All 24 local image URLs available; desktop design reviewed visually |
| Shopping filters | Home category tabs, under-LKR-5,000 collection and exact LKR 200–400 filtering passed |
| Guest cart | LKR 200 sample item added, displayed with correct price and removed |
| Premium prices | LKR 329,000 laptop appeared in the premium range with the correct currency |
| Mobile browser | No horizontal overflow; menu passed; no browser runtime errors |

A private database backup was made before importing. No real order, payment, refund or customer email was created by the checks. Existing backend business logic and migration history were retained.

- [Desktop preview](red-storefront-desktop.jpg)
- [Mobile preview](red-storefront-mobile.jpg)
- [Sample catalog setup and photo sources](../SAMPLE_CATALOG.md)

The local app is available at http://localhost:3000. The sample seed is optional; it is not a startup migration. Public deployment and merging remain deferred.
