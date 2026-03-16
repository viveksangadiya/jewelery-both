-- ============================================================
-- RETURNS & EXCHANGE MIGRATION
-- Run: psql your_database_name < src/config/returns_migration.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS return_requests (
  id                SERIAL PRIMARY KEY,
  return_number     VARCHAR(50) UNIQUE NOT NULL,
  order_id          INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Type: return (refund) or exchange
  type              VARCHAR(20) NOT NULL DEFAULT 'return' CHECK (type IN ('return', 'exchange')),

  -- Status flow: pending → approved → picked_up → received → completed / rejected
  status            VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'picked_up', 'received', 'refunded', 'exchanged')),

  reason            VARCHAR(100) NOT NULL,
  description       TEXT,

  -- Refund details
  refund_amount     DECIMAL(10,2),
  refund_method     VARCHAR(50),  -- original_payment, bank_transfer, store_credit
  refund_status     VARCHAR(30) DEFAULT 'pending' CHECK (refund_status IN ('pending', 'processing', 'completed')),

  -- Admin notes
  admin_notes       TEXT,
  rejection_reason  TEXT,

  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Items in the return request
CREATE TABLE IF NOT EXISTS return_items (
  id                SERIAL PRIMARY KEY,
  return_id         INTEGER NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  order_item_id     INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  quantity          INTEGER NOT NULL DEFAULT 1,
  reason            TEXT
);

CREATE INDEX IF NOT EXISTS idx_returns_order   ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user    ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_status  ON return_requests(status);

SELECT 'Returns migration complete' AS status;

-- Add Shiprocket reverse shipment columns
ALTER TABLE return_requests
  ADD COLUMN IF NOT EXISTS shiprocket_return_id  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS return_shipment_id     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS return_awb             VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pickup_scheduled_at    TIMESTAMP;

SELECT 'Shiprocket return columns added' AS status;
