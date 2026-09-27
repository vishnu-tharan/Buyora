ALTER TABLE inventory_transactions DROP CONSTRAINT inventory_transactions_type_check;
ALTER TABLE inventory_transactions ADD CONSTRAINT inventory_transactions_type_check
    CHECK (type IN ('RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN', 'RESERVATION', 'RELEASE'));
ALTER TABLE inventory_items ADD CONSTRAINT inventory_reserved_within_stock
    CHECK (reserved_quantity <= stock_quantity);
CREATE UNIQUE INDEX inventory_reservation_reference
    ON inventory_transactions(reference_id, variant_id, type)
    WHERE type IN ('RESERVATION', 'SALE', 'RELEASE') AND reference_id IS NOT NULL;
