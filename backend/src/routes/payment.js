const express = require('express');
const crypto = require('crypto');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const shiprocket = require('../services/shiprocket');

const router = express.Router();

const generateOrderNumber = () => {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `JWL-${t}-${r}`;
};

// ── Build cart totals ─────────────────────────────────────
async function buildOrderFromCart(userId, coupon_code, client) {
  const cartResult = await client.query(`
    SELECT ci.*, p.name, p.base_price, p.sale_price, p.stock,
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image,
      pv.price_modifier
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_variants pv ON ci.variant_id = pv.id
    WHERE ci.user_id = $1
  `, [userId]);

  if (cartResult.rows.length === 0) throw new Error('Cart is empty');

  const cartItems = cartResult.rows;
  let subtotal = 0;
  for (const item of cartItems) {
    const price = parseFloat(item.sale_price || item.base_price) + parseFloat(item.price_modifier || 0);
    subtotal += price * item.quantity;
  }

  let discount = 0, couponId = null;
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
  const total = Math.round(subtotal - discount + shipping);
  return { cartItems, subtotal, discount, couponId, shipping, total };
}

// ── Insert order row ──────────────────────────────────────
async function insertOrder(client, params) {
  const { orderNumber, userId, subtotal, discount, shipping, total,
          couponId, payment_method, payment_status, shipping_address, notes } = params;
  const r = await client.query(`
    INSERT INTO orders (order_number, user_id, status, subtotal, discount, shipping_charge, total,
      coupon_id, payment_method, payment_status, shipping_address, notes)
    VALUES ($1,$2,'pending',$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
  `, [orderNumber, userId, subtotal, discount, shipping, total,
      couponId, payment_method, payment_status, JSON.stringify(shipping_address), notes || '']);
  return r.rows[0];
}

// ── Insert order items + deduct stock ─────────────────────
async function insertOrderItems(client, orderId, cartItems) {
  for (const item of cartItems) {
    const price = parseFloat(item.sale_price || item.base_price) + parseFloat(item.price_modifier || 0);
    await client.query(`
      INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price)
      VALUES ($1,$2,$3,$4,$5,$6)
    `, [orderId, item.product_id, item.name, item.image, item.quantity, price]);
    await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
  }
}

// ── Auto push to Shiprocket ───────────────────────────────
async function pushToShiprocket(order) {
  try {
    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [order.id]);
    const userResult  = await pool.query('SELECT email FROM users WHERE id=$1', [order.user_id]);
    const shippingAddress = typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address)
      : order.shipping_address;

    const { shiprocket_order_id, shipment_id } = await shiprocket.createShiprocketOrder(
      { ...order, customer_email: userResult.rows[0]?.email },
      itemsResult.rows,
      shippingAddress
    );

    await pool.query(
      `UPDATE orders SET shiprocket_order_id=$1, shipment_id=$2, status='confirmed', updated_at=NOW() WHERE id=$3`,
      [String(shiprocket_order_id), String(shipment_id), order.id]
    );

    console.log(`✅ Shiprocket: order ${order.order_number} → SR #${shiprocket_order_id}`);
    return { shiprocket_order_id, shipment_id };
  } catch (err) {
    console.error('⚠️  Shiprocket push failed:', err.response?.data || err.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════
// POST /api/payment/create-order   (Razorpay)
// ════════════════════════════════════════════════════════
router.post('/create-order', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { shipping_address, coupon_code, notes } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Razorpay keys not configured in .env' });
    }

    await client.query('BEGIN');
    const { cartItems, subtotal, discount, couponId, shipping, total } =
      await buildOrderFromCart(req.user.id, coupon_code, client);

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rzpOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    const orderNumber = generateOrderNumber();
    const order = await insertOrder(client, {
      orderNumber, userId: req.user.id, subtotal, discount, shipping, total,
      couponId, payment_method: 'razorpay', payment_status: 'pending',
      shipping_address, notes,
    });
    await insertOrderItems(client, order.id, cartItems);
    await client.query('UPDATE orders SET payment_id=$1 WHERE id=$2', [rzpOrder.id, order.id]);
    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        razorpay_order_id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        order_id: order.id,
        order_number: order.order_number,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create payment order' });
  } finally {
    client.release();
  }
});

// ════════════════════════════════════════════════════════
// POST /api/payment/verify   (Razorpay callback)
// ════════════════════════════════════════════════════════
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const result = await pool.query(
      `UPDATE orders SET payment_status='paid', payment_id=$1, updated_at=NOW()
       WHERE payment_id=$2 AND user_id=$3 RETURNING *`,
      [razorpay_payment_id, razorpay_order_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = result.rows[0];
    await pool.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);
    pushToShiprocket(order);

    res.json({
      success: true,
      message: 'Payment confirmed! Your order is being prepared.',
      data: { order_number: order.order_number, order_id: order.id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/payment/cod-order   (Cash on Delivery)
// ════════════════════════════════════════════════════════
router.post('/cod-order', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { shipping_address, coupon_code, notes } = req.body;

    const { cartItems, subtotal, discount, couponId, shipping, total } =
      await buildOrderFromCart(req.user.id, coupon_code, client);

    const orderNumber = generateOrderNumber();
    const order = await insertOrder(client, {
      orderNumber, userId: req.user.id, subtotal, discount, shipping, total,
      couponId, payment_method: 'cod', payment_status: 'pending',
      shipping_address, notes,
    });
    await insertOrderItems(client, order.id, cartItems);
    await client.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);
    await client.query('COMMIT');

    pushToShiprocket(order);

    res.status(201).json({
      success: true,
      message: 'Order placed! Cash to be paid on delivery.',
      data: { order_number: order.order_number, order_id: order.id, total },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Failed to place order' });
  } finally {
    client.release();
  }
});

// ════════════════════════════════════════════════════════
// POST /api/payment/track-update
// Register this URL in Shiprocket → Settings → Webhooks
// ════════════════════════════════════════════════════════
router.post('/track-update', async (req, res) => {
  try {
    const event = req.body;
    // Optional token check (enable after testing)
    // const incomingToken = req.headers['x-api-key'];
    // const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    // if (expectedToken && incomingToken !== expectedToken) {
    //   return res.status(401).json({ success: false, message: 'Unauthorized' });
    // }
    console.log('📦 Shiprocket webhook received:', event?.current_status);

    const srOrderId = String(event?.order_id || event?.data?.order_id || '');
    const srStatus  = String(event?.current_status || event?.data?.current_status || '').toUpperCase();
    const awb       = event?.awb || event?.data?.awb;
    const courier   = event?.courier || event?.data?.courier_name;

    if (!srOrderId) return res.json({ success: true });

    const statusMap = {
      'PICKUP GENERATED': 'confirmed',
      'PICKUP SCHEDULED': 'processing',
      'PICKUP QUEUED':    'processing',
      'PICKED UP':        'processing',
      'IN TRANSIT':       'shipped',
      'OUT FOR DELIVERY': 'shipped',
      'DELIVERED':        'delivered',
      'CANCELLED':        'cancelled',
      'RTO INITIATED':    'cancelled',
      'RTO':              'cancelled',
      'RTO DELIVERED':    'cancelled',
      'LOST':             'cancelled',
    };

    const newStatus = statusMap[srStatus];
    if (newStatus) {
      const updates = ['status=$1', 'updated_at=NOW()'];
      const params = [newStatus];

      if (awb) {
        updates.push(`awb_code=$${params.length + 1}`);
        params.push(awb);
        updates.push(`tracking_url=$${params.length + 1}`);
        params.push(`https://shiprocket.co/tracking/${awb}`);
      }
      if (courier) {
        updates.push(`courier_name=$${params.length + 1}`);
        params.push(courier);
      }

      params.push(srOrderId);
      await pool.query(
        `UPDATE orders SET ${updates.join(', ')} WHERE shiprocket_order_id=$${params.length}`,
        params
      );
      console.log(`✅ Webhook: SR #${srOrderId} → ${newStatus}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;