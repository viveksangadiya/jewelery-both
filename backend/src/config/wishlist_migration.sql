-- ============================================================
-- WISHLIST MIGRATION
-- Run: psql your_database_name < src/config/wishlist_migration.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS wishlists (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user    ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);

SELECT 'Wishlist migration complete' AS status;
