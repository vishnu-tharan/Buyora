# Practical audit — 29 October 2026

## Scope

Reviewed authentication and permissions, cart and coupon handling, stock reservation, checkout totals and duplicate submissions, order ownership/status changes, payment callbacks, returns/refunds, addresses, reviews, and the shared UI components.

Browser checks exercise navigation, registration validation, search/category loading, product options/tabs, price filtering, cart error states, checkout through review, and public-page layouts on desktop and mobile. The checkout browser test uses controlled responses and stops before submitting an order. Backend integration tests exercise real PostgreSQL databases in disposable containers.

## Fixes

- Profile updates allow an omitted or cleared optional phone number while rejecting malformed numbers.
- Admin sign-out now calls the server logout, clears cached private data and ends the browser session.
- An expired or unavailable saved coupon no longer blocks cart loading.
- Adding products after completing an order resets checkout for the next order.
- Selecting an already-default shipping/billing address preserves that default.
- Price sliders and separators use the installed UI library's orientation attributes.
- Single-variant products display their selected option consistently; option buttons expose selection to assistive technology.
- Payment-method loading, delivery failures and unavailable districts have clear messages.
- Public pages have one main-content region; authentication pages have a main heading and a working skip-link target.
- Admin icon actions have descriptive labels; checkout uses red progress/selection styling and a visible quantity badge.
- Docker health checks work when the public website uses a different port.

## Results

- Frontend: lint, 79 unit/component tests and production build passed.
- Backend: 57 tests passed, including 18 integration tests against disposable PostgreSQL databases.
- Browser: 70 desktop/mobile checks passed. The public-screen sweep checks 19 routes at both sizes, including missing-page errors and horizontal overflow. Checkout checks LKR 400 subtotal minus LKR 50 discount plus LKR 350 shipping equals LKR 700.
- Runtime: three Docker services; the current database is retained.

## Verification limits

Passing checks do not prove every possible input, browser, screen width or concurrency scenario is correct. Signed-in account and admin business rules were reviewed in code and covered where present by tests; this audit did not manually perform every administrator create/edit/delete action against the user's database. Full live PayHere payment/refund and courier-provider flows still require configured sandbox/provider credentials and end-to-end callbacks. No real payment was made and no existing account, order, product or database volume was deleted.

Local port 3000 was serving another application. Buyora's private local configuration now uses port 3015; no credentials were changed. Use the port configured in `.env`.
