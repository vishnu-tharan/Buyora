# State transitions

Online checkout: PENDING_PAYMENT → PROCESSING after verified successful payment. COD starts processing with payment unconfirmed. Admin fulfillment: PAYMENT_CONFIRMED → PROCESSING → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED. Invalid jumps are rejected. Customer cancellation is limited to owned pending-payment orders and releases reserved stock.

Returns require an owned delivered order within the configured window and currently cover the complete order. PENDING → APPROVED or REJECTED; APPROVED → RECEIVED. Provider-confirmed refund processing is not implemented, so administrative requests cannot falsely mark a refund complete.

New reviews start PENDING. Administrators approve or reject them. Public lists and rating aggregates use APPROVED reviews only. Migration V11 preserves existing reviews as approved; review legacy content before release.
