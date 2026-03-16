-- ============================================================
-- REVIEWS MIGRATION
-- Run: psql your_database_name < src/config/reviews_migration.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id           SERIAL PRIMARY KEY,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id     INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title        VARCHAR(150),
  comment      TEXT,
  is_approved  BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, user_id)   -- one review per product per user
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user    ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(product_id, is_approved);

SELECT 'Reviews migration complete' AS status;

-- Fix any existing reviews that were saved with is_approved = false
UPDATE reviews SET is_approved = true WHERE is_approved = false;

SELECT 'Existing reviews approved' AS status;
