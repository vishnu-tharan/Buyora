# API contracts

Controllers under src/main/java/com/buyora/api define /api/v1 routes. Request DTO validation and response mappings are authoritative. Frontend adapters are documented in BuyoraFrontend/docs/API_INTEGRATION.md.

Authentication uses cookies and CSRF; mutations should obtain /auth/csrf and send the returned header/token with credentials. Admin routes require ADMIN. Numeric database IDs and UUID public IDs are not interchangeable: address routes use public UUIDs, while cart items, variants and administrative records use their declared numeric IDs.

Order status updates accept a JSON body with status and optional notes. Inventory adjustments accept quantity and reason. New reviews accept rating/title/body and await moderation. Coupon requests use code/type/value, purchase bounds, start/end dates, usage limit and isActive.

Errors use HTTP status codes; unavailable or rejected actions must not be represented as successful empty records. Live contract verification remains pending the database-backed environment.
