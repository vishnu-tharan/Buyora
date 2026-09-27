# Inventory concurrency

Inventory operations lock records in a stable order. Quantities must be positive for reserve/confirm/release operations; adjustments cannot reduce stock below reservations. Arithmetic overflow is rejected. Database checks enforce stock/reservation bounds.

Reservation, sale and release ledger entries make repeated stock transitions idempotent. Checkout and payment changes run transactionally. Coupon rows and order rows are locked during relevant mutations.

Focused unit tests cover stock bounds and repeat operations. Database isolation, deadlocks and concurrent checkout still require Testcontainers and load testing. Existing invalid stock data must be reconciled before migration V9. No reservation-expiry scheduler or provider-reconciliation guarantee is claimed.
