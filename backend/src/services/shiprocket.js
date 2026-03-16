const axios = require('axios');

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Shiprocket and return a Bearer token.
 * Token is cached for 9 days (expires in 10 days per Shiprocket docs).
 */
async function getToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const res = await axios.post(`${SHIPROCKET_BASE}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  });

  cachedToken = res.data.token;
  // Cache for 9 days (token valid for 10 days)
  tokenExpiry = now + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create a Shiprocket order after a customer places an order.
 * Returns { shiprocket_order_id, shipment_id }
 */
async function createShiprocketOrder(order, items, shippingAddress) {
  const token = await getToken();

  const orderItems = items.map((item) => ({
    name: item.product_name,
    sku: `SKU-${item.product_id}`,
    units: item.quantity,
    selling_price: parseFloat(item.price),
    discount: 0,
    tax: 0,
    hsn: '',
  }));

  const totalWeight = items.reduce((sum, item) => sum + 0.3 * item.quantity, 0); // 300g per item default

  const payload = {
    order_id: order.order_number,
    order_date: new Date(order.created_at).toISOString().split('T')[0],
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    channel_id: '',
    comment: order.notes || '',
    billing_customer_name: shippingAddress.name,
    billing_last_name: '',
    billing_address: shippingAddress.address_line1,
    billing_address_2: shippingAddress.address_line2 || '',
    billing_city: shippingAddress.city,
    billing_pincode: shippingAddress.pincode,
    billing_state: shippingAddress.state,
    billing_country: shippingAddress.country || 'India',
    billing_email: order.customer_email || 'customer@example.com',
    billing_phone: shippingAddress.phone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
    shipping_charges: parseFloat(order.shipping_charge || 0),
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: parseFloat(order.discount || 0),
    sub_total: parseFloat(order.subtotal),
    length: 15,
    breadth: 10,
    height: 5,
    weight: totalWeight || 0.3,
  };

  const res = await axios.post(
    `${SHIPROCKET_BASE}/orders/create/adhoc`,
    payload,
    { headers: authHeaders(token) }
  );

  return {
    shiprocket_order_id: res.data.order_id,
    shipment_id: res.data.shipment_id,
  };
}

/**
 * Get tracking info for a shipment.
 */
async function trackShipment(shipmentId) {
  const token = await getToken();
  const res = await axios.get(
    `${SHIPROCKET_BASE}/courier/track/shipment/${shipmentId}`,
    { headers: authHeaders(token) }
  );
  return res.data;
}

/**
 * Track by order ID.
 */
async function trackByOrderId(shiprocketOrderId) {
  const token = await getToken();
  const res = await axios.get(
    `${SHIPROCKET_BASE}/orders/show/${shiprocketOrderId}`,
    { headers: authHeaders(token) }
  );
  return res.data;
}

/**
 * Check courier serviceability for a pincode.
 */
async function checkServiceability(pickupPincode, deliveryPincode, weight = 0.3, cod = 0) {
  const token = await getToken();
  const res = await axios.get(`${SHIPROCKET_BASE}/courier/serviceability/`, {
    headers: authHeaders(token),
    params: {
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight,
      cod,
    },
  });
  return res.data;
}

/**
 * Cancel a Shiprocket order.
 */
async function cancelOrder(shiprocketOrderIds) {
  const token = await getToken();
  const res = await axios.post(
    `${SHIPROCKET_BASE}/orders/cancel`,
    { ids: Array.isArray(shiprocketOrderIds) ? shiprocketOrderIds : [shiprocketOrderIds] },
    { headers: authHeaders(token) }
  );
  return res.data;
}

/**
 * Generate AWB (Air Waybill) for a shipment — assigns a courier.
 */
async function generateAWB(shipmentId, courierId) {
  const token = await getToken();
  // Shiprocket requires integer shipment_id and courier_company_id (not courier_id)
  const payload = {
    shipment_id: parseInt(shipmentId, 10),
    courier_company_id: parseInt(courierId, 10),
  };
  console.log('🔧 generateAWB payload:', payload);
  const res = await axios.post(
    `${SHIPROCKET_BASE}/courier/assign/awb`,
    payload,
    { headers: authHeaders(token) }
  );
  return res.data;
}

/**
 * Schedule a pickup for a shipment.
 */
async function schedulePickup(shipmentIds) {
  const token = await getToken();
  const ids = Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds];
  // Shiprocket requires integer shipment IDs
  const payload = { shipment_id: ids.map(id => parseInt(id, 10)) };
  console.log('🔧 schedulePickup payload:', payload);
  const res = await axios.post(
    `${SHIPROCKET_BASE}/courier/generate/pickup`,
    payload,
    { headers: authHeaders(token) }
  );
  return res.data;
}


/**
 * Create a Shiprocket REVERSE pickup order for returns/exchanges.
 * Shiprocket API: POST /v1/external/orders/create/return
 * Returns { shiprocket_return_id, return_shipment_id }
 */
async function createReturnOrder(returnRequest, orderItems, customerAddress) {
  const token = await getToken();

  const items = orderItems.map(item => ({
    name: item.product_name,
    sku: `SKU-${item.product_id || item.order_item_id}`,
    units: item.quantity,
    selling_price: parseFloat(item.price || 0),
    discount: 0,
    tax: 0,
    hsn: '',
  }));

  const totalWeight = orderItems.reduce((sum, item) => sum + 0.3 * item.quantity, 0) || 0.3;

  // Shiprocket reverse order payload
  // Customer address = pickup (they return to us)
  // Our warehouse = delivery
  const payload = {
    order_id: `RET-${returnRequest.return_number}`,
    order_date: new Date().toISOString().split('T')[0],

    // Pickup from customer
    pickup_customer_name: customerAddress.name,
    pickup_last_name: '',
    pickup_address: customerAddress.address_line1,
    pickup_address_2: customerAddress.address_line2 || '',
    pickup_city: customerAddress.city,
    pickup_state: customerAddress.state,
    pickup_country: customerAddress.country || 'India',
    pickup_pincode: String(customerAddress.pincode),
    pickup_email: customerAddress.email || 'customer@example.com',
    pickup_phone: String(customerAddress.phone),
    pickup_isd_code: '91',

    // Deliver to our warehouse
    shipping_customer_name: 'Lumière Jewels Returns',
    shipping_last_name: '',
    shipping_address: process.env.SHIPROCKET_RETURN_ADDRESS || '123 Warehouse, Mumbai',
    shipping_city: process.env.SHIPROCKET_RETURN_CITY || 'Mumbai',
    shipping_state: process.env.SHIPROCKET_RETURN_STATE || 'Maharashtra',
    shipping_country: 'India',
    shipping_pincode: String(process.env.SHIPROCKET_PICKUP_PINCODE || '400001'),
    shipping_email: process.env.SHIPROCKET_EMAIL,
    shipping_phone: process.env.SHIPROCKET_PHONE || '9999999999',
    shipping_isd_code: '91',

    order_items: items,
    payment_method: 'Prepaid', // returns are always prepaid
    sub_total: parseFloat(returnRequest.refund_amount || 0),
    length: 15,
    breadth: 10,
    height: 5,
    weight: totalWeight,
  };

  const res = await axios.post(
    `${SHIPROCKET_BASE}/orders/create/return`,
    payload,
    { headers: authHeaders(token) }
  );

  return {
    shiprocket_return_id: res.data.order_id,
    return_shipment_id: res.data.shipment_id,
  };
}

/**
 * Track a return shipment by AWB.
 */
async function trackReturnShipment(awb) {
  const token = await getToken();
  const res = await axios.get(
    `${SHIPROCKET_BASE}/courier/track/awb/${awb}`,
    { headers: authHeaders(token) }
  );
  return res.data;
}

module.exports = {
  getToken,
  createShiprocketOrder,
  trackShipment,
  trackByOrderId,
  checkServiceability,
  cancelOrder,
  generateAWB,
  schedulePickup,
  createReturnOrder,
  trackReturnShipment,
};