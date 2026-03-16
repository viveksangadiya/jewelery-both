-- ============================================================
-- MIGRATION: Add Shiprocket fields to orders table
-- Run once: psql -U postgres -d jewelry_store -f shiprocket_migration.sql
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shiprocket_order_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipment_id         VARCHAR(100),
  ADD COLUMN IF NOT EXISTS awb_code            VARCHAR(100),
  ADD COLUMN IF NOT EXISTS courier_name        VARCHAR(200),
  ADD COLUMN IF NOT EXISTS tracking_url        VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_orders_shiprocket ON orders(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_awb        ON orders(awb_code);

COMMIT;
