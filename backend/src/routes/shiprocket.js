const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const shiprocket = require('../services/shiprocket');

const router = express.Router();

// ── Public: Track order by order number ──────────────────
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.email as customer_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.order_number = $1`,
      [req.params.orderNumber]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = result.rows[0];
    let tracking = null;
    if (order.shipment_id) {
      try { tracking = await shiprocket.trackShipment(order.shipment_id); }
      catch (err) { console.error('Tracking error:', err.message); }
    }
    res.json({
      success: true,
      data: {
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        shiprocket_order_id: order.shiprocket_order_id,
        shipment_id: order.shipment_id,
        awb_code: order.awb_code,
        courier_name: order.courier_name,
        tracking_url: order.tracking_url,
        tracking,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Public: Check pincode serviceability ─────────────────
router.get('/serviceability', async (req, res) => {
  try {
    const { pincode, weight = 0.3 } = req.query;
    if (!pincode) return res.status(400).json({ success: false, message: 'pincode is required' });

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '400001';
    const data = await shiprocket.checkServiceability(pickupPincode, pincode, weight, 1);
    const couriers = data?.data?.available_courier_companies || [];
    const cheapest = couriers.sort((a, b) => a.rate - b.rate)[0];

    res.json({
      success: true,
      data: {
        is_serviceable: couriers.length > 0,
        couriers: couriers.slice(0, 5),
        cheapest_rate: cheapest?.rate || null,
        estimated_delivery: cheapest?.etd || null,
      },
    });
  } catch (err) {
    console.error('Serviceability error:', err.message);
    res.json({ success: true, data: { is_serviceable: true, couriers: [] } });
  }
});

// ── Admin: Full push — create + assign AWB + schedule pickup ──
router.post('/push-order/:orderId', authenticate, isAdmin, async (req, res) => {
  try {
    const orderResult = await pool.query(
      `SELECT o.*, u.email as customer_email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [req.params.orderId]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orderResult.rows[0];
    let shiprocket_order_id = order.shiprocket_order_id;
    let shipment_id = order.shipment_id;

    // Step 1: Create order on Shiprocket (skip if already done)
    if (!shiprocket_order_id) {
      const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [order.id]);
      const shippingAddress = typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address;

      const sr = await shiprocket.createShiprocketOrder(order, itemsResult.rows, shippingAddress);
      shiprocket_order_id = String(sr.shiprocket_order_id);
      shipment_id = String(sr.shipment_id);

      await pool.query(
        `UPDATE orders SET shiprocket_order_id=$1, shipment_id=$2, status='confirmed', updated_at=NOW() WHERE id=$3`,
        [shiprocket_order_id, shipment_id, order.id]
      );
      console.log(`✅ Step 1: Order created on SR — ${shiprocket_order_id}`);
    } else {
      console.log(`⏭  Step 1 skipped: already on SR — ${shiprocket_order_id}`);
    }

    await new Promise(r => setTimeout(r, 2000));

    // Step 2: Auto-assign cheapest courier & generate AWB
    let awb_code = order.awb_code;
    let courier_name = order.courier_name;

    if (!awb_code) {
      try {
        const shippingAddress = typeof order.shipping_address === 'string'
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;
        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '400001';
        const deliveryPincode = shippingAddress?.pincode || '400001';
        const isCOD = order.payment_method === 'cod' ? 1 : 0;

        console.log(`🔍 Checking serviceability: ${pickupPincode} → ${deliveryPincode}, COD: ${isCOD}`);
        const svcData = await shiprocket.checkServiceability(pickupPincode, deliveryPincode, 0.3, isCOD);
        const couriers = svcData?.data?.available_courier_companies || [];
        console.log(`📦 Available couriers: ${couriers.length}`);

        if (couriers.length === 0) {
          console.error('⚠️  No couriers available for this pincode. Cannot generate AWB.');
        } else {
          const cheapest = couriers.sort((a, b) => a.rate - b.rate)[0];
          console.log(`🚚 Selected courier: ${cheapest.courier_name} (ID: ${cheapest.courier_company_id}), Rate: ${cheapest.rate}`);

          const awbData = await shiprocket.generateAWB(shipment_id, cheapest.courier_company_id);
          console.log('AWB full response:', JSON.stringify(awbData, null, 2));

          const awbAssignStatus = awbData?.awb_assign_status;
          awb_code = awbData?.response?.data?.awb_code || null;

          if (awb_code && awbAssignStatus !== 0) {
            courier_name = awbData?.response?.data?.courier_name || cheapest.courier_name;
            await pool.query(
              `UPDATE orders SET awb_code=$1, courier_name=$2, tracking_url=$3, updated_at=NOW() WHERE id=$4`,
              [awb_code, courier_name, `https://shiprocket.co/tracking/${awb_code}`, order.id]
            );
            console.log('Step 2 OK: AWB=' + awb_code + ' via ' + courier_name);
          } else {
            const reason = awbData?.awb_assign_error || awbData?.response?.data?.message || 'unknown';
            console.error('AWB assignment failed, status=' + awbAssignStatus + ', reason=' + reason);
            awb_code = null;
          }
        }
      } catch (awbErr) {
        console.error('⚠️  AWB generation failed:', awbErr.response?.data || awbErr.message);
      }
    } else {
      console.log(`⏭  Step 2 skipped: AWB already exists — ${awb_code}`);
    }

    await new Promise(r => setTimeout(r, 1500));

    // Step 3: Schedule pickup
    let pickupScheduled = false;
    try {
      await shiprocket.schedulePickup(shipment_id);
      await pool.query(
        `UPDATE orders SET status='processing', updated_at=NOW() WHERE id=$1`,
        [order.id]
      );
      pickupScheduled = true;
      console.log(`✅ Step 3: Pickup scheduled for shipment ${shipment_id}`);
    } catch (pickupErr) {
      console.error('⚠️  Pickup scheduling failed:', pickupErr.response?.data || pickupErr.message);
    }

    res.json({
      success: true,
      message: pickupScheduled
        ? '✅ Order pushed, AWB generated & pickup scheduled!'
        : '✅ Order pushed to Shiprocket (pickup scheduling pending)',
      data: {
        shiprocket_order_id,
        shipment_id,
        awb_code: awb_code || null,
        courier_name: courier_name || null,
        pickup_scheduled: pickupScheduled,
      },
    });
  } catch (err) {
    console.error('Push order error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to push order to Shiprocket',
    });
  }
});

// ── Admin: DEBUG — inspect shipment state on Shiprocket ──
router.get('/debug-shipment/:orderId', authenticate, isAdmin, async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.orderId]);
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const token = await shiprocket.getToken();
    const axios = require('axios');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    let shipmentDetails = null, serviceability = null;

    try {
      const r = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/shipments/show?id=${order.shipment_id}`,
        { headers }
      );
      shipmentDetails = r.data;
    } catch (e) {
      shipmentDetails = { error: e.response?.data || e.message };
    }

    try {
      const addr = typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address) : order.shipping_address;
      const pickup = process.env.SHIPROCKET_PICKUP_PINCODE || '400001';
      serviceability = await shiprocket.checkServiceability(pickup, addr?.pincode, 0.3, order.payment_method === 'cod' ? 1 : 0);
    } catch (e) {
      serviceability = { error: e.response?.data || e.message };
    }

    res.json({
      success: true,
      debug: {
        db_order: {
          id: order.id,
          shiprocket_order_id: order.shiprocket_order_id,
          shipment_id: order.shipment_id,
          awb_code: order.awb_code,
          courier_name: order.courier_name,
          payment_method: order.payment_method,
          status: order.status,
          shipping_address: typeof order.shipping_address === 'string'
            ? JSON.parse(order.shipping_address) : order.shipping_address,
        },
        env: {
          SHIPROCKET_PICKUP_PINCODE: process.env.SHIPROCKET_PICKUP_PINCODE || '(not set)',
          SHIPROCKET_PICKUP_LOCATION: process.env.SHIPROCKET_PICKUP_LOCATION || '(not set)',
        },
        shipment_on_shiprocket: shipmentDetails,
        serviceability_couriers: (serviceability?.data?.available_courier_companies || []).map(c => ({
          id: c.courier_company_id,
          name: c.courier_name,
          rate: c.rate,
          cod: c.cod,
          etd: c.etd,
        })),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Generate AWB manually ─────────────────────────
router.post('/generate-awb/:orderId', authenticate, isAdmin, async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.orderId]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orderResult.rows[0];
    if (!order.shipment_id) {
      return res.status(400).json({ success: false, message: 'Push order to Shiprocket first to get a shipment ID' });
    }

    let { courier_id } = req.body;

    if (!courier_id) {
      console.log('ℹ️  No courier_id provided — auto-selecting cheapest courier...');
      const shippingAddress = typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address) : order.shipping_address;
      const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '400001';
      const deliveryPincode = shippingAddress?.pincode || '400001';
      const isCOD = order.payment_method === 'cod' ? 1 : 0;
      const svcData = await shiprocket.checkServiceability(pickupPincode, deliveryPincode, 0.3, isCOD);
      const couriers = svcData?.data?.available_courier_companies || [];
      if (couriers.length === 0) {
        return res.status(400).json({ success: false, message: `No couriers available for pincode ${deliveryPincode}` });
      }
      const cheapest = couriers.sort((a, b) => a.rate - b.rate)[0];
      courier_id = cheapest.courier_company_id;
      console.log(`🚚 Auto-selected courier: ${cheapest.courier_name} (ID: ${courier_id})`);
    }

    const parsedCourierId = parseInt(courier_id, 10);
    if (isNaN(parsedCourierId)) {
      return res.status(400).json({ success: false, message: `Invalid courier_id: ${courier_id}` });
    }

    const data = await shiprocket.generateAWB(order.shipment_id, parsedCourierId);
    const awb = data?.response?.data?.awb_code || null;
    const courierName = data?.response?.data?.courier_name || null;
    const awbAssignStatus = data?.awb_assign_status;

    if (!awb || awbAssignStatus === 0) {
      const errorMsg = data?.response?.data?.['message'] || data?.awb_assign_error || 'AWB assignment failed';
      return res.status(400).json({ success: false, message: errorMsg, shiprocket_response: data });
    }

    await pool.query(
      `UPDATE orders SET awb_code=$1, courier_name=$2, tracking_url=$3, updated_at=NOW() WHERE id=$4`,
      [awb, courierName, `https://shiprocket.co/tracking/${awb}`, order.id]
    );

    res.json({
      success: true,
      data: { awb_code: awb, courier_name: courierName, tracking_url: `https://shiprocket.co/tracking/${awb}` }
    });
  } catch (err) {
    console.error('AWB generation error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to generate AWB',
      details: err.response?.data || null,
    });
  }
});

// ── Admin: Schedule pickup manually ──────────────────────
router.post('/schedule-pickup/:orderId', authenticate, isAdmin, async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.orderId]);
    const order = orderResult.rows[0];
    if (!order?.shipment_id) {
      return res.status(400).json({ success: false, message: 'No shipment ID found' });
    }
    const data = await shiprocket.schedulePickup(order.shipment_id);
    await pool.query(`UPDATE orders SET status='processing', updated_at=NOW() WHERE id=$1`, [order.id]);
    res.json({ success: true, message: 'Pickup scheduled', data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to schedule pickup' });
  }
});

// ── Admin: Cancel Shiprocket order ───────────────────────
router.post('/cancel/:orderId', authenticate, isAdmin, async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.orderId]);
    const order = orderResult.rows[0];
    if (!order?.shiprocket_order_id) {
      return res.status(400).json({ success: false, message: 'Order not on Shiprocket' });
    }
    await shiprocket.cancelOrder(order.shiprocket_order_id);
    await pool.query(`UPDATE orders SET status='cancelled', updated_at=NOW() WHERE id=$1`, [order.id]);
    res.json({ success: true, message: 'Order cancelled on Shiprocket' });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
});

// ── Admin: Get tracking details ───────────────────────────
router.get('/tracking/:orderId', authenticate, isAdmin, async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.orderId]);
    const order = orderResult.rows[0];
    if (!order?.shipment_id) {
      return res.status(400).json({ success: false, message: 'No shipment found' });
    }
    const tracking = await shiprocket.trackShipment(order.shipment_id);
    res.json({ success: true, data: tracking });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch tracking' });
  }
});

// ════════════════════════════════════════════════════════
// RETURNS — Shiprocket reverse pickup routes
// ════════════════════════════════════════════════════════

// ── Admin: Create reverse pickup for a return ─────────────
// POST /api/shiprocket/returns/:returnId/push
router.post('/returns/:returnId/push', authenticate, isAdmin, async (req, res) => {
  try {
    // Get return request with order details
    const retResult = await pool.query(`
      SELECT rr.*, o.shipping_address, o.user_id
      FROM return_requests rr
      JOIN orders o ON o.id = rr.order_id
      WHERE rr.id = $1
    `, [req.params.returnId]);

    if (!retResult.rows.length)
      return res.status(404).json({ success: false, message: 'Return not found' });

    const ret = retResult.rows[0];

    if (ret.shiprocket_return_id)
      return res.status(400).json({ success: false, message: 'Reverse pickup already created on Shiprocket' });

    // Get return items
    const itemsResult = await pool.query(`
      SELECT ri.quantity, oi.product_name, oi.product_id, oi.price, ri.order_item_id
      FROM return_items ri
      JOIN order_items oi ON oi.id = ri.order_item_id
      WHERE ri.return_id = $1
    `, [ret.id]);

    // Get customer address + email
    const customerAddress = typeof ret.shipping_address === 'string'
      ? JSON.parse(ret.shipping_address)
      : ret.shipping_address;

    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [ret.user_id]);
    customerAddress.email = userResult.rows[0]?.email;

    // Create reverse order on Shiprocket
    const srReturn = await shiprocket.createReturnOrder(ret, itemsResult.rows, customerAddress);

    // Save Shiprocket return IDs + update status
    await pool.query(`
      UPDATE return_requests
      SET shiprocket_return_id = $1,
          return_shipment_id = $2,
          status = 'approved',
          pickup_scheduled_at = NOW(),
          updated_at = NOW()
      WHERE id = $3
    `, [String(srReturn.shiprocket_return_id), String(srReturn.return_shipment_id), ret.id]);

    await pool.query(
      "UPDATE orders SET status = 'return_approved', updated_at = NOW() WHERE id = $1",
      [ret.order_id]
    );

    console.log(`✅ Shiprocket reverse pickup created for return ${ret.return_number}:`, srReturn);

    res.json({
      success: true,
      message: '✅ Reverse pickup created on Shiprocket',
      data: {
        shiprocket_return_id: srReturn.shiprocket_return_id,
        return_shipment_id: srReturn.return_shipment_id,
      },
    });
  } catch (err) {
    console.error('Reverse pickup error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to create reverse pickup',
      details: err.response?.data || null,
    });
  }
});

// ── Admin: Generate AWB for return shipment ───────────────
// POST /api/shiprocket/returns/:returnId/awb
router.post('/returns/:returnId/awb', authenticate, isAdmin, async (req, res) => {
  try {
    const retResult = await pool.query(
      'SELECT * FROM return_requests WHERE id = $1',
      [req.params.returnId]
    );
    if (!retResult.rows.length)
      return res.status(404).json({ success: false, message: 'Return not found' });

    const ret = retResult.rows[0];
    if (!ret.return_shipment_id)
      return res.status(400).json({ success: false, message: 'Push to Shiprocket first to get return_shipment_id' });

    if (ret.return_awb)
      return res.status(400).json({ success: false, message: 'AWB already generated for this return' });

    // Auto-select cheapest courier for return
    const pickupPincode = String(process.env.SHIPROCKET_PICKUP_PINCODE || '400001');
    const orderResult = await pool.query('SELECT shipping_address FROM orders WHERE id = $1', [ret.order_id]);
    const addr = typeof orderResult.rows[0]?.shipping_address === 'string'
      ? JSON.parse(orderResult.rows[0].shipping_address)
      : orderResult.rows[0]?.shipping_address;

    const deliveryPincode = String(addr?.pincode || '400001');
    const svcData = await shiprocket.checkServiceability(pickupPincode, deliveryPincode, 0.3, 0);
    const couriers = svcData?.data?.available_courier_companies || [];

    if (!couriers.length)
      return res.status(400).json({ success: false, message: 'No couriers available for this pincode' });

    const cheapest = couriers.sort((a, b) => a.rate - b.rate)[0];
    const awbData = await shiprocket.generateAWB(ret.return_shipment_id, cheapest.courier_company_id);

    const awb = awbData?.response?.data?.awb_code || null;
    const courierName = awbData?.response?.data?.courier_name || cheapest.courier_name;

    if (!awb)
      return res.status(400).json({ success: false, message: 'AWB generation failed', shiprocket_response: awbData });

    await pool.query(
      'UPDATE return_requests SET return_awb = $1, updated_at = NOW() WHERE id = $2',
      [awb, ret.id]
    );

    console.log(`✅ Return AWB generated: ${awb} for return ${ret.return_number}`);

    res.json({
      success: true,
      data: {
        return_awb: awb,
        courier_name: courierName,
        tracking_url: `https://shiprocket.co/tracking/${awb}`,
      }
    });
  } catch (err) {
    console.error('Return AWB error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to generate return AWB',
    });
  }
});

// ── Public: Track return shipment by return ID ────────────
// GET /api/shiprocket/returns/:returnId/track  (auth required — only owner)
router.get('/returns/:returnId/track', authenticate, async (req, res) => {
  try {
    const retResult = await pool.query(
      'SELECT * FROM return_requests WHERE id = $1 AND user_id = $2',
      [req.params.returnId, req.user.id]
    );
    if (!retResult.rows.length)
      return res.status(404).json({ success: false, message: 'Return not found' });

    const ret = retResult.rows[0];

    if (!ret.return_awb) {
      return res.json({
        success: true,
        data: null,
        message: 'Tracking not available yet — AWB not assigned',
      });
    }

    const tracking = await shiprocket.trackReturnShipment(ret.return_awb);
    res.json({ success: true, data: tracking });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Tracking unavailable' });
  }
});

module.exports = router;
