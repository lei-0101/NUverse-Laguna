-- Adds gender targeting to merchandise products (MALE, FEMALE, UNISEX).
-- Default UNISEX preserves existing product behaviour.
ALTER TABLE merchandise_products
    ADD COLUMN gender VARCHAR(20) NOT NULL DEFAULT 'UNISEX';

CREATE INDEX idx_merchandise_products_gender ON merchandise_products (gender);
