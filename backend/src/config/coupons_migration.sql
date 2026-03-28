-- ============================================================
-- COUPONS MIGRATION
-- Run: psql your_database_name < src/config/coupons_migration.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS coupons (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(50) UNIQUE NOT NULL,
  type            VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value           DECIMAL(10,2) NOT NULL,        -- % or ₹ amount
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_discount    DECIMAL(10,2),                  -- cap for percentage coupons
  usage_limit     INTEGER,                        -- NULL = unlimited
  used_count      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  expires_at      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Track which users used which coupons
CREATE TABLE IF NOT EXISTS coupon_usages (
  id         SERIAL PRIMARY KEY,
  coupon_id  INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id   INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  used_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)   -- one use per user per coupon
);

CREATE INDEX IF NOT EXISTS idx_coupons_code   ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- Sample coupons
INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, expires_at)
VALUES
  ('WELCOME10',  'percentage', 10, 500,   500,  NULL, NOW() + INTERVAL '1 year'),
  ('FLAT500',    'fixed',      500, 2000, NULL,  100,  NOW() + INTERVAL '6 months'),
  ('DIWALI20',   'percentage', 20, 1000, 1000,  500,  NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;

SELECT 'Coupons migration complete' AS status;
