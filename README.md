# Buyora

Developer: Vishnu

- **BuyoraFrontend/**: Next.js storefront, customer account and administration interface.
- **BuyoraBackend/**: Spring Boot API, migrations, tests and development infrastructure.

Start with each application's README. The projects run independently; the frontend connects through NEXT_PUBLIC_API_BASE_URL.

The audit repaired authorization, checkout, payment verification, inventory, API contracts and administrative workflows. Production acceptance is **not complete**: database-backed integration tests require Docker, and payment, email and storage still need end-to-end validation with configured services. See [the audit](BuyoraFrontend/docs/BUYORA_SYSTEM_AUDIT.md) and [test matrix](BuyoraFrontend/docs/BUYORA_TEST_MATRIX.md).
