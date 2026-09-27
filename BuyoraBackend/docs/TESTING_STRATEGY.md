# Verification

Run ./mvnw verify with Docker available. Testcontainers supplies the database for integration checks. Missing Docker is a failed environment prerequisite, not a passing or skipped test result.

Focused tests cover Argon2 hashing, coupon pricing/eligibility, inventory bounds/idempotency, payment ownership, PayHere signature/amount handling and mail message delivery construction. These use isolated dependencies and do not prove database isolation or SMTP/provider delivery.

Required acceptance includes migrations, concurrent checkout/last-item/coupon redemption, CSRF/role/object ownership, duplicate webhook delivery, provider failure/late settlement, guest identity continuity, email links, media upload and return/refund policy. Test evidence is summarized in BuyoraFrontend/docs/BUYORA_TEST_MATRIX.md.
