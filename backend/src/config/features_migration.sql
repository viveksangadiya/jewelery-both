-- ============================================================
-- FEATURES MIGRATION
-- Run this SQL on your PostgreSQL database
-- ============================================================

-- 1. Google OAuth support on users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'local';

-- Make password nullable (Google users won't have one)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 2. Product sizes table
CREATE TABLE IF NOT EXISTS product_sizes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,         -- e.g. "6", "7", "S", "M", "Free Size"
  price_modifier DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- 3. Custom description / engraving option on products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS allow_custom_text BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_text_label VARCHAR(255) DEFAULT 'Custom Engraving / Note',
  ADD COLUMN IF NOT EXISTS custom_text_max_length INTEGER DEFAULT 50;

-- 4. Store selected size + custom text in order items
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS size_label VARCHAR(100),
  ADD COLUMN IF NOT EXISTS custom_text VARCHAR(500);

-- 5. Store selected size + custom text in cart items
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS size_id INTEGER REFERENCES product_sizes(id),
  ADD COLUMN IF NOT EXISTS custom_text VARCHAR(500);

-- Drop old unique constraint on cart (size changes what's unique)
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_variant_id_key;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_unique
  UNIQUE (user_id, product_id, variant_id, size_id);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_product_sizes_product ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Done
SELECT 'Migration complete' as status;
