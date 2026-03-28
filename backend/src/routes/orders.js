const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const shiprocket = require('../services/shiprocket');

const router = express.Router();

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `JWL-${timestamp}-${random}`;
};

async function pushToShiprocket(order, client) {
  try {
    const itemsResult = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    const shippingAddress = typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address) : order.shipping_address;
    const userResult = await client.query('SELECT email FROM users WHERE id = $1', [order.user_id]);
    const orderWithEmail = { ...order, customer_email: userResult.rows[0]?.email };
    const { shiprocket_order_id, shipment_id } = await shiprocket.createShiprocketOrder(
      orderWithEmail, itemsResult.rows, shippingAddress
    );
    await client.query(
      `UPDATE orders SET shiprocket_order_id=$1, shipment_id=$2, status='confirmed', updated_at=NOW() WHERE id=$3`,
      [String(shiprocket_order_id), String(shipment_id), order.id]
    );
    return { shiprocket_order_id, shipment_id };
  } catch (err) {
    console.error('⚠️  Shiprocket push failed (order still created):', err.response?.data || err.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════
// IMPORTANT: Specific routes MUST come before /:id
// ════════════════════════════════════════════════════════

// ── GET /api/orders  — user's orders ─────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/orders/validate-coupon ─────────────────────
router.post('/validate-coupon', authenticate, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    const couponResult = await pool.query(
      `SELECT * FROM coupons WHERE UPPER(code)=UPPER($1) AND is_active=true AND (expires_at IS NULL OR expires_at > NOW())`,
      [code]
    );
    if (couponResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
    }
    const coupon = couponResult.rows[0];

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // Check per-user usage (one use per user)
    const userUsage = await pool.query(
      'SELECT id FROM coupon_usages WHERE coupon_id=$1 AND user_id=$2',
      [coupon.id, req.user.id]
    );
    if (userUsage.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    }

    // Check minimum order value
    if (parseFloat(subtotal) < parseFloat(coupon.min_order_value)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value ₹${coupon.min_order_value} required for this coupon`
      });
    }

    const discount = coupon.type === 'percentage'
      ? Math.min(parseFloat(subtotal) * coupon.value / 100, coupon.max_discount || Infinity)
      : parseFloat(coupon.value);

    res.json({
      success: true,
      data: {
        discount: Math.round(discount),
        coupon_id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      }
    });
  } catch (err) {
    console.error('Coupon validation error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/orders/admin/all ─────────────────────────────
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push(`o.status = $${params.length + 1}`);
      params.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit, offset);

    const result = await pool.query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${where}
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/orders/admin/:id/status ─────────────────────
router.put('/admin/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/orders/:id  — MUST be after all specific routes
router.get('/:id', authenticate, async (req, res) => {
  try {
    const orderResult = await pool.query(
      `SELECT o.*,
        u.name as customer_name, u.email as customer_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id=$1 AND o.user_id=$2`,
      [req.params.id, req.user.id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = orderResult.rows[0];
    const items = await pool.query(`
      SELECT oi.*,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = true LIMIT 1) as product_image
      FROM order_items oi
      WHERE oi.order_id=$1
    `, [order.id]);
    order.items = items.rows;
    order.shipping_address = typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address)
      : order.shipping_address;
    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/orders ──────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { shipping_address, payment_method = 'cod', coupon_code, notes } = req.body;

    const cartResult = await client.query(`
      SELECT ci.*, p.name, p.base_price, p.sale_price, p.stock,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image,
        pv.price_modifier,
        ps.label as size_label
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      LEFT JOIN product_sizes ps ON ci.size_id = ps.id
      WHERE ci.user_id = $1
    `, [req.user.id]);

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let subtotal = 0;
    const cartItems = cartResult.rows;
    for (const item of cartItems) {
      const price = parseFloat(item.sale_price || item.base_price) + parseFloat(item.price_modifier || 0);
      subtotal += price * item.quantity;
    }

    let discount = 0;
    let couponId = null;
    if (coupon_code) {
      const couponResult = await client.query(
        `SELECT * FROM coupons WHERE code=$1 AND is_active=true AND (expires_at IS NULL OR expires_at > NOW())`,
        [coupon_code]
      );
      if (couponResult.rows.length > 0) {
        const coupon = couponResult.rows[0];
        if (subtotal >= coupon.min_order_value) {
          discount = coupon.type === 'percentage'
            ? Math.min(subtotal * coupon.value / 100, coupon.max_discount || Infinity)
            : coupon.value;
          couponId = coupon.id;
          await client.query('UPDATE coupons SET used_count = used_count + 1 WHERE id=$1', [coupon.id]);
        }
      }
    }

    const shipping = subtotal >= 999 ? 0 : 99;
    const total = subtotal - discount + shipping;
    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(`
      INSERT INTO orders (order_number, user_id, status, subtotal, discount, shipping_charge, total,
        coupon_id, payment_method, payment_status, shipping_address, notes)
      VALUES ($1,$2,'pending',$3,$4,$5,$6,$7,$8,'pending',$9,$10)
      RETURNING *
    `, [orderNumber, req.user.id, subtotal, discount, shipping, total, couponId,
        payment_method, JSON.stringify(shipping_address), notes]);

    const order = orderResult.rows[0];

    for (const item of cartItems) {
      const price = parseFloat(item.sale_price || item.base_price) + parseFloat(item.price_modifier || 0);
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, size_label, custom_text)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `, [order.id, item.product_id, item.name, item.image, item.quantity, price, item.size_label || null, item.custom_text || null]);
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    await client.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);
    await client.query('COMMIT');

    const srResult = await pushToShiprocket(order, pool);

    res.status(201).json({
      success: true,
      data: {
        ...order,
        shiprocket_order_id: srResult?.shiprocket_order_id || null,
        shipment_id: srResult?.shipment_id || null,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
