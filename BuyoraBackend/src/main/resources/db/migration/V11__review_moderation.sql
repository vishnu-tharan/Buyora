ALTER TABLE reviews ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE reviews ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE reviews ADD CONSTRAINT reviews_status_check CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));
CREATE INDEX reviews_product_status_idx ON reviews(product_id, status, created_at DESC);
