# Buyora security model

Authentication uses HttpOnly access and refresh cookies, configurable Secure/SameSite attributes and Argon2id passwords. The JWT filter verifies the current user's enabled/account state. Backend administrator routes require ADMIN. Order/payment access additionally checks user identity or the owning guest-cart cookie.

Cookie-authenticated mutations require Spring Security CSRF validation. Only provider webhooks are excluded and must authenticate their payloads. CORS permits configured explicit origins with credentials. Public order/status routing does not bypass service-layer ownership checks.

PayHere verifies its specified digest and merchant, currency and amount before an order transition. Repeated successful callbacks do not confirm stock twice. Stripe is not a supported completed payment integration.

Rate limits are bounded per-process buckets using the direct remote address. Configure trusted reverse-proxy and shared/edge limits for a multi-instance deployment. Safe HTTP errors avoid exposing internal exception text.

Remaining limits: access tokens are not immediately revoked on logout/password change; refresh rotation, durable payment-event auditing, CSP, upload validation penetration tests and distributed rate-limit validation remain open. See the frontend system audit for release gates.
