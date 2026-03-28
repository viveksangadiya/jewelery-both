-- Fix orders status check constraint to include return statuses
-- Run: psql your_database_name < fix_order_status.sql

-- Drop old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add updated constraint with all statuses
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'return_requested',
    'return_approved',
    'return_picked_up',
    'return_received'
  ));

SELECT 'Order status constraint updated ✓' AS result;
