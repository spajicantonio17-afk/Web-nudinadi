-- Performance indexes for common queries

-- GIN index for tag-based product search
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags);

-- Compound index for seller's active listings (used on profile, my-listings)
CREATE INDEX IF NOT EXISTS idx_products_seller_status ON products (seller_id, status);

-- Index for transaction lookups by product
CREATE INDEX IF NOT EXISTS idx_transactions_product_status ON transactions (product_id, status);
