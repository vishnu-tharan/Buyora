# Buyora API integration

The shared client in src/lib/api/client.ts uses NEXT_PUBLIC_API_BASE_URL, credentialed requests and a CSRF token from GET /auth/csrf before unsafe methods. Endpoints are relative to /api/v1. HTTP errors are surfaced through BuyoraApiError. Empty responses and multipart bodies are supported; no fake success data is substituted.

| Workflow | Contract |
| --- | --- |
| Authentication | Cookie login/register/refresh/logout, GET /auth/me, verification/reset routes; user data is returned without bearer tokens |
| Catalog | GET /products with zero-based paging and catalog filters; GET /products/{slug}, /products/by-id/{id}; categories and paged brands |
| Cart | Cookie-bound guest cart or current user's cart; numeric item/variant identifiers; quantity mutations and coupon validation on server |
| Checkout | Preview configured delivery/payment methods; submit validated address, guest email when needed, selected methods and stable idempotency key |
| Payment | Initiation and status enforce order ownership; PayHere callback reads server payment state; webhook performs verification |
| Addresses | UUID publicId in routes; adapter maps frontend defaults to backend default-shipping/default-billing flags |
| Reviews | Numeric product identity, body/rating fields, pageable approved reviews; new reviews require moderation |
| Admin | /admin routes require server ADMIN role; frontend role checks are navigation aids only |

Source controllers and request DTOs are authoritative. The integration audit records unresolved workflows; browser mocks do not verify these APIs against a database.
