const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const shiprocket = require('../services/shiprocket');

const generateReturnNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `RET-${ts}-${rand}`;
};

// ════════════════════════════════════════════════════════
// GET /api/returns  — user's return requests
// ════════════════════════════════════════════════════════
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rr.*,
        o.order_number,
        json_agg(json_build_object(
          'id', ri.id,
          'order_item_id', ri.order_item_id,
          'quantity', ri.quantity,
          'product_name', oi.product_name,
          'product_image', oi.product_image,
          'price', oi.price
        )) AS items
      FROM return_requests rr
      JOIN orders o ON o.id = rr.order_id
      LEFT JOIN return_items ri ON ri.return_id = rr.id
      LEFT JOIN order_items oi ON oi.id = ri.order_item_id
      WHERE rr.user_id = $1
      GROUP BY rr.id, o.order_number
      ORDER BY rr.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/returns/:id  — single return detail
// ════════════════════════════════════════════════════════
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rr.*,
        o.order_number, o.total as order_total,
        json_agg(json_build_object(
          'id', ri.id,
          'order_item_id', ri.order_item_id,
          'quantity', ri.quantity,
          'product_name', oi.product_name,
          'product_image', oi.product_image,
          'price', oi.price
        )) AS items
      FROM return_requests rr
      JOIN orders o ON o.id = rr.order_id
      LEFT JOIN return_items ri ON ri.return_id = rr.id
      LEFT JOIN order_items oi ON oi.id = ri.order_item_id
      WHERE rr.id = $1 AND rr.user_id = $2
      GROUP BY rr.id, o.order_number, o.total
    `, [req.params.id, req.user.id]);

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Return request not found' });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/returns  — create return/exchange request
// ════════════════════════════════════════════════════════
router.post('/', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { order_id, type = 'return', reason, description, items, refund_method = 'original_payment' } = req.body;

    if (!order_id || !reason || !items?.length) {
      return res.status(400).json({ success: false, message: 'order_id, reason and items are required' });
    }

    // Verify order belongs to user and is in returnable status
    const order = await client.query(`
      SELECT * FROM orders WHERE id = $1 AND user_id = $2
    `, [order_id, req.user.id]);

    if (!order.rows.length)
      return res.status(404).json({ success: false, message: 'Order not found' });

    const ord = order.rows[0];
    const returnableStatuses = ['delivered', 'confirmed', 'processing', 'shipped'];
    if (!returnableStatuses.includes(ord.status))
      return res.status(400).json({ success: false, message: `Orders with status "${ord.status}" cannot be returned` });

    // Check 30-day window
    const deliveredDate = ord.updated_at || ord.created_at;
    const daysSince = Math.floor((Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 30)
      return res.status(400).json({ success: false, message: 'Return window has expired (30 days from delivery)' });

    // Check no existing active return for this order
    const existing = await client.query(`
      SELECT id FROM return_requests
      WHERE order_id = $1 AND status NOT IN ('rejected', 'refunded', 'exchanged')
    `, [order_id]);
    if (existing.rows.length)
      return res.status(400).json({ success: false, message: 'A return request already exists for this order' });

    // Calculate refund amount from items
    let refundAmount = 0;
    for (const item of items) {
      const oi = await client.query(
        'SELECT price, quantity FROM order_items WHERE id = $1 AND order_id = $2',
        [item.order_item_id, order_id]
      );
      if (oi.rows.length) {
        refundAmount += parseFloat(oi.rows[0].price) * (item.quantity || 1);
      }
    }

    // Create return request
    const returnResult = await client.query(`
      INSERT INTO return_requests
        (return_number, order_id, user_id, type, reason, description, refund_amount, refund_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [generateReturnNumber(), order_id, req.user.id, type, reason, description || null, refundAmount, refund_method]);

    const returnRequest = returnResult.rows[0];

    // Insert return items
    for (const item of items) {
      await client.query(`
        INSERT INTO return_items (return_id, order_item_id, quantity, reason)
        VALUES ($1, $2, $3, $4)
      `, [returnRequest.id, item.order_item_id, item.quantity || 1, item.reason || null]);
    }

    // Update order status to indicate return in progress
    await client.query(
      "UPDATE orders SET status = 'return_requested', updated_at = NOW() WHERE id = $1",
      [order_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: returnRequest, message: 'Return request submitted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// ════════════════════════════════════════════════════════
// DELETE /api/returns/:id  — cancel return (only if pending)
// ════════════════════════════════════════════════════════
router.delete('/:id', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ret = await client.query(
      'SELECT * FROM return_requests WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!ret.rows.length)
      return res.status(404).json({ success: false, message: 'Return not found' });
    if (ret.rows[0].status !== 'pending')
      return res.status(400).json({ success: false, message: 'Only pending returns can be cancelled' });

    await client.query('DELETE FROM return_requests WHERE id = $1', [req.params.id]);

    // Revert order status
    await client.query(
      "UPDATE orders SET status = 'delivered', updated_at = NOW() WHERE id = $1",
      [ret.rows[0].order_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Return request cancelled' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

// ════════════════════════════════════════════════════════
// ADMIN routes
// ════════════════════════════════════════════════════════

// GET /api/returns/admin/all
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) { conditions.push(`rr.status = $${idx++}`); params.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit, offset);

    const result = await pool.query(`
      SELECT rr.*, o.order_number, u.name as customer_name, u.email as customer_email
      FROM return_requests rr
      JOIN orders o ON o.id = rr.order_id
      JOIN users u ON u.id = rr.user_id
      ${where}
      ORDER BY rr.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `, params);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/returns/admin/:id/status
router.put('/admin/:id/status', authenticate, isAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { status, admin_notes, rejection_reason } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'picked_up', 'received', 'refunded', 'exchanged'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const result = await client.query(`
      UPDATE return_requests
      SET status = $1, admin_notes = $2, rejection_reason = $3, updated_at = NOW()
      WHERE id = $4 RETURNING *
    `, [status, admin_notes || null, rejection_reason || null, req.params.id]);

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Return not found' });

    const ret = result.rows[0];

    // ── When APPROVED: create Shiprocket reverse pickup ──────
    if (status === 'approved' && !ret.shiprocket_return_id) {
      try {
        // Get order items for this return
        const itemsResult = await client.query(`
          SELECT ri.quantity, oi.product_name, oi.product_id, oi.price, ri.order_item_id
          FROM return_items ri
          JOIN order_items oi ON oi.id = ri.order_item_id
          WHERE ri.return_id = $1
        `, [ret.id]);

        // Get customer shipping address from original order
        const orderResult = await client.query(
          'SELECT shipping_address, user_id FROM orders WHERE id = $1',
          [ret.order_id]
        );
        const order = orderResult.rows[0];
        const customerAddress = typeof order.shipping_address === 'string'
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;

        // Get customer email
        const userResult = await client.query('SELECT email FROM users WHERE id = $1', [order.user_id]);
        customerAddress.email = userResult.rows[0]?.email;

        // Create reverse order on Shiprocket
        const srReturn = await shiprocket.createReturnOrder(ret, itemsResult.rows, customerAddress);

        // Save Shiprocket return IDs
        await client.query(`
          UPDATE return_requests
          SET shiprocket_return_id = $1,
              return_shipment_id = $2,
              pickup_scheduled_at = NOW(),
              updated_at = NOW()
          WHERE id = $3
        `, [String(srReturn.shiprocket_return_id), String(srReturn.return_shipment_id), ret.id]);

        console.log(`✅ Shiprocket reverse pickup created for return ${ret.return_number}:`, srReturn);
      } catch (srErr) {
        // Don't fail the approval if Shiprocket fails — log and continue
        console.error('⚠️  Shiprocket reverse pickup failed (return still approved):', srErr.response?.data || srErr.message);
      }
    }

    // Update order status based on return status
    let orderStatus = null;
    if (status === 'approved')  orderStatus = 'return_approved';
    if (status === 'rejected')  orderStatus = 'delivered';
    if (status === 'refunded')  orderStatus = 'refunded';
    if (status === 'exchanged') orderStatus = 'delivered';

    if (orderStatus) {
      await client.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
        [orderStatus, ret.order_id]
      );
    }

    if (status === 'refunded') {
      await client.query(
        "UPDATE return_requests SET refund_status = 'completed' WHERE id = $1",
        [req.params.id]
      );
    }

    await client.query('COMMIT');

    // Return updated record with Shiprocket IDs
    const updated = await pool.query('SELECT * FROM return_requests WHERE id = $1', [req.params.id]);
    res.json({ success: true, data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// ════════════════════════════════════════════════════════
// GET /api/returns/:id/track  — track return shipment via Shiprocket
// ════════════════════════════════════════════════════════
router.get('/:id/track', authenticate, async (req, res) => {
  try {
    const ret = await pool.query(
      'SELECT * FROM return_requests WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!ret.rows.length)
      return res.status(404).json({ success: false, message: 'Return not found' });

    const { return_awb, return_shipment_id } = ret.rows[0];

    if (!return_awb && !return_shipment_id) {
      return res.json({ success: true, data: null, message: 'Tracking not available yet — pickup not scheduled' });
    }

    const tracking = await shiprocket.trackReturnShipment(return_awb || return_shipment_id);
    res.json({ success: true, data: tracking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Tracking unavailable' });
  }
});

module.exports = router;
