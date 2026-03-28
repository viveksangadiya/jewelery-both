/**
 * ══════════════════════════════════════════════════════════
 *  LUMIÈRE JEWELRY — FULL API TEST SUITE
 *  Run: node test.js
 *  Requires: backend running on localhost:5003
 * ══════════════════════════════════════════════════════════
 */

const BASE = process.env.API_URL || 'http://localhost:5003/api';

// ── Colour helpers ────────────────────────────────────────
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', blue: '\x1b[34m', magenta: '\x1b[35m', white: '\x1b[37m',
};
const pass  = (s) => `${c.green}✓${c.reset} ${s}`;
const fail  = (s) => `${c.red}✗${c.reset} ${s}`;
const skip  = (s) => `${c.yellow}○${c.reset} ${c.dim}${s}${c.reset}`;
const info  = (s) => `  ${c.dim}${s}${c.reset}`;
const head  = (s) => `\n${c.bold}${c.cyan}▸ ${s}${c.reset}`;
const title = (s) => `\n${c.bold}${c.blue}${'═'.repeat(55)}\n  ${s}\n${'═'.repeat(55)}${c.reset}`;

// ── State ─────────────────────────────────────────────────
let userToken = '', adminToken = '', userId = 0;
let productSlug = '', productId = 0, categoryId = 0;
let cartItemId = 0, orderId = 0, reviewProductId = 0;
let couponCode = 'TESTCOUPON' + Date.now().toString(36).toUpperCase();

// ── Results ───────────────────────────────────────────────
const results = { pass: 0, fail: 0, skip: 0, errors: [] };

// ── HTTP helper ───────────────────────────────────────────
async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, data: json };
}

// ── Test runner ───────────────────────────────────────────
async function test(name, fn) {
  try {
    const result = await fn();
    if (result === 'skip') {
      console.log(skip(name));
      results.skip++;
    } else {
      console.log(pass(name));
      results.pass++;
    }
  } catch (err) {
    console.log(fail(name));
    console.log(info(`Error: ${err.message}`));
    results.fail++;
    results.errors.push({ name, error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// ══════════════════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════════════════

async function runTests() {
  console.log(title('LUMIÈRE API TEST SUITE'));
  console.log(info(`Base URL: ${BASE}`));
  console.log(info(`Started:  ${new Date().toLocaleString()}`));

  // ── 1. AUTH ─────────────────────────────────────────────
  console.log(head('1. AUTH'));

  const testEmail = `test_${Date.now()}@lumiere.test`;
  const testPass  = 'Test@1234';

  await test('Register new user', async () => {
    const r = await req('POST', '/auth/register', {
      name: 'Test User', email: testEmail, password: testPass, phone: '9876543210'
    });
    assert(r.status === 201, `Expected 201, got ${r.status}`);
    assert(r.data.success, r.data.message);
    userToken = r.data.data.token;
    userId    = r.data.data.user.id;
    console.log(info(`User ID: ${userId}`));
  });

  await test('Login with credentials', async () => {
    const r = await req('POST', '/auth/login', { email: testEmail, password: testPass });
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(r.data.success, r.data.message);
    assert(r.data.data.token, 'No token returned');
    userToken = r.data.data.token;
  });

  await test('Login with wrong password → 401', async () => {
    const r = await req('POST', '/auth/login', { email: testEmail, password: 'wrongpass' });
    assert(r.status === 401 || !r.data.success, `Expected 401, got ${r.status}`);
  });

  await test('Get profile (authenticated)', async () => {
    const r = await req('GET', '/auth/profile', null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(r.data.data.email === testEmail, 'Email mismatch');
  });

  await test('Get profile without token → 401', async () => {
    const r = await req('GET', '/auth/profile');
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  // Admin login
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lumiere.com';
  const adminPass  = process.env.ADMIN_PASS  || 'Admin@1234';
  await test('Admin login', async () => {
    const r = await req('POST', '/auth/login', { email: adminEmail, password: adminPass });
    if (r.status !== 200 || !r.data.success) return 'skip';
    assert(r.data.data.user.role === 'admin', 'User is not admin');
    adminToken = r.data.data.token;
    console.log(info('Admin token acquired'));
  });

  // ── 2. CATEGORIES ────────────────────────────────────────
  console.log(head('2. CATEGORIES'));

  await test('Get all categories', async () => {
    const r = await req('GET', '/categories');
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(Array.isArray(r.data.data), 'Expected array');
    if (r.data.data.length > 0) {
      categoryId = r.data.data[0].id;
      console.log(info(`Found ${r.data.data.length} categories, using ID: ${categoryId}`));
    }
  });

  await test('Create category (admin only)', async () => {
    if (!adminToken) return 'skip';
    const r = await req('POST', '/categories', {
      name: 'Test Category ' + Date.now(), slug: 'test-cat-' + Date.now(), is_active: true
    }, adminToken);
    assert(r.status === 201 || r.data.success, r.data.message);
  });

  // ── 3. PRODUCTS ──────────────────────────────────────────
  console.log(head('3. PRODUCTS'));

  await test('Get products list', async () => {
    const r = await req('GET', '/products?limit=5');
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(Array.isArray(r.data.data), 'Expected array');
    assert(r.data.pagination, 'No pagination object');
    if (r.data.data.length > 0) {
      productSlug = r.data.data[0].slug;
      productId   = r.data.data[0].id;
      reviewProductId = productId;
      console.log(info(`Found ${r.data.pagination.total} products, using: ${productSlug}`));
    }
  });

  await test('Get products with filters (category, price, sort)', async () => {
    const r = await req('GET', '/products?sort=price_asc&min_price=100&max_price=50000&limit=5');
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  await test('Get single product by slug', async () => {
    if (!productSlug) return 'skip';
    const r = await req('GET', `/products/${productSlug}`);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(r.data.data.name, 'No product name');
    assert(r.data.data.base_price, 'No base price');
    console.log(info(`Product: ${r.data.data.name} @ ₹${r.data.data.base_price}`));
  });

  await test('Get similar products', async () => {
    if (!productId) return 'skip';
    const r = await req('GET', `/products/${productId}/similar`);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(Array.isArray(r.data.data), 'Expected array');
  });

  await test('Get non-existent product → 404', async () => {
    const r = await req('GET', '/products/this-slug-does-not-exist-99999');
    assert(r.status === 404 || !r.data.success, `Expected 404, got ${r.status}`);
  });

  await test('Get filter options', async () => {
    const r = await req('GET', '/products/filter-options');
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  // ── 4. CART ──────────────────────────────────────────────
  console.log(head('4. CART'));

  await test('Get cart (empty)', async () => {
    const r = await req('GET', '/cart', null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(r.data.data.items !== undefined, 'No items array');
  });

  await test('Add item to cart', async () => {
    if (!productId) return 'skip';
    const r = await req('POST', '/cart/add', { product_id: productId, quantity: 2 }, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  await test('Cart has item after adding', async () => {
    const r = await req('GET', '/cart', null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(r.data.data.items.length > 0, 'Cart is still empty after adding');
    assert(r.data.data.subtotal > 0, 'Subtotal is 0 or NaN');
    cartItemId = r.data.data.items[0].id;
    console.log(info(`Cart subtotal: ₹${r.data.data.subtotal}, item ID: ${cartItemId}`));
  });

  await test('Update cart item quantity', async () => {
    if (!cartItemId) return 'skip';
    const r = await req('PUT', `/cart/${cartItemId}`, { quantity: 3 }, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  await test('Add to cart without auth → 401', async () => {
    const r = await req('POST', '/cart/add', { product_id: productId, quantity: 1 });
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  // ── 5. COUPON ────────────────────────────────────────────
  console.log(head('5. COUPONS'));

  await test('Create coupon (admin)', async () => {
    if (!adminToken) return 'skip';
    const r = await req('POST', '/coupons', {
      code: couponCode, type: 'percentage', value: 10, min_order_value: 100
    }, adminToken);
    assert(r.status === 201 && r.data.success, r.data.message);
    console.log(info(`Coupon created: ${couponCode}`));
  });

  await test('Validate valid coupon', async () => {
    const r = await req('POST', '/orders/validate-coupon', {
      code: couponCode, subtotal: 5000
    }, userToken);
    if (!adminToken) return 'skip'; // Only works if coupon was created
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(r.data.data.discount > 0, 'Discount is 0');
    console.log(info(`Discount: ₹${r.data.data.discount}`));
  });

  await test('Validate invalid coupon → error', async () => {
    const r = await req('POST', '/orders/validate-coupon', {
      code: 'INVALIDCOUPON999', subtotal: 5000
    }, userToken);
    assert(r.status === 400 || !r.data.success, `Expected failure, got success`);
  });

  await test('Validate coupon below min order → error', async () => {
    const r = await req('POST', '/orders/validate-coupon', {
      code: couponCode, subtotal: 50
    }, userToken);
    if (!adminToken) return 'skip';
    assert(!r.data.success, 'Should fail for low subtotal');
  });

  await test('Get all coupons (admin)', async () => {
    if (!adminToken) return 'skip';
    const r = await req('GET', '/coupons', null, adminToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(Array.isArray(r.data.data), 'Expected array');
  });

  // ── 6. ORDERS ────────────────────────────────────────────
  console.log(head('6. ORDERS'));

  await test('Get user orders (empty for new user)', async () => {
    const r = await req('GET', '/orders', null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(Array.isArray(r.data.data), 'Expected array');
  });

  await test('Create COD order', async () => {
    if (!productId) return 'skip';
    // Ensure cart has item
    await req('POST', '/cart/add', { product_id: productId, quantity: 1 }, userToken);
    const r = await req('POST', '/orders', {
      payment_method: 'cod',
      shipping_address: {
        name: 'Test User', phone: '9876543210',
        address_line1: '123 Test Street', city: 'Mumbai',
        state: 'Maharashtra', pincode: '400001', country: 'India'
      }
    }, userToken);
    assert(r.status === 201 && r.data.success, `${r.status}: ${r.data.message}`);
    orderId = r.data.data.id;
    console.log(info(`Order created: ${r.data.data.order_number}`));
  });

  await test('Get order by ID', async () => {
    if (!orderId) return 'skip';
    const r = await req('GET', `/orders/${orderId}`, null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(r.data.data.order_number, 'No order number');
  });

  await test('Cannot access another user order', async () => {
    if (!orderId) return 'skip';
    // Try to access with no token — should fail
    const r = await req('GET', `/orders/${orderId}`);
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  await test('Admin: get all orders', async () => {
    if (!adminToken) return 'skip';
    const r = await req('GET', '/orders/admin/all', null, adminToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(Array.isArray(r.data.data), 'Expected array');
    console.log(info(`Total orders: ${r.data.data.length}`));
  });

  await test('Admin: update order status', async () => {
    if (!adminToken || !orderId) return 'skip';
    const r = await req('PUT', `/orders/admin/${orderId}/status`, { status: 'confirmed' }, adminToken);
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  // ── 7. WISHLIST ──────────────────────────────────────────
  console.log(head('7. WISHLIST'));

  await test('Get wishlist', async () => {
    const r = await req('GET', '/wishlist', null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  await test('Toggle wishlist (add)', async () => {
    if (!productId) return 'skip';
    const r = await req('POST', '/wishlist/toggle', { product_id: productId }, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    console.log(info(`Wishlisted: ${r.data.data?.wishlisted}`));
  });

  await test('Toggle wishlist (remove)', async () => {
    if (!productId) return 'skip';
    const r = await req('POST', '/wishlist/toggle', { product_id: productId }, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  // ── 8. REVIEWS ───────────────────────────────────────────
  console.log(head('8. REVIEWS'));

  await test('Get product reviews', async () => {
    if (!reviewProductId) return 'skip';
    const r = await req('GET', `/reviews/${reviewProductId}`);
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  await test('Check can-review (needs purchase)', async () => {
    if (!reviewProductId) return 'skip';
    const r = await req('GET', `/reviews/${reviewProductId}/can-review`, null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    console.log(info(`Can review: ${r.data.data?.purchased}`));
  });

  await test('Get my review for product', async () => {
    if (!reviewProductId) return 'skip';
    const r = await req('GET', `/reviews/${reviewProductId}/my`, null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  // ── 9. SHIPROCKET ────────────────────────────────────────
  console.log(head('9. SHIPROCKET'));

  await test('Check serviceability — valid pincode', async () => {
    const r = await req('GET', '/shiprocket/serviceability?pincode=400001');
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(r.data.data.is_serviceable !== undefined, 'No is_serviceable field');
    console.log(info(`Mumbai 400001 serviceable: ${r.data.data.is_serviceable}`));
    if (r.data.data.estimated_delivery) {
      console.log(info(`ETD: ${r.data.data.estimated_delivery}`));
    }
  });

  await test('Check serviceability — invalid pincode → graceful error', async () => {
    const r = await req('GET', '/shiprocket/serviceability?pincode=000000');
    assert(r.status === 200, `Expected 200 (graceful), got ${r.status}`);
  });

  await test('Serviceability without pincode → 400', async () => {
    const r = await req('GET', '/shiprocket/serviceability');
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  // ── 10. RETURNS ──────────────────────────────────────────
  console.log(head('10. RETURNS'));

  await test('Get user returns (empty)', async () => {
    const r = await req('GET', '/returns', null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
    assert(Array.isArray(r.data.data), 'Expected array');
  });

  await test('Create return for non-existent order → error', async () => {
    const r = await req('POST', '/returns', {
      order_id: 999999, type: 'return', reason: 'Damaged', items: [{ order_item_id: 1, quantity: 1 }]
    }, userToken);
    assert(r.status === 404 || !r.data.success, 'Expected failure for fake order');
  });

  if (orderId) {
    await test('Create return for real order', async () => {
      // Get order items first
      const orderRes = await req('GET', `/orders/${orderId}`, null, userToken);
      if (!orderRes.data.data?.items?.length) return 'skip';
      const itemId = orderRes.data.data.items[0].id;
      const r = await req('POST', '/returns', {
        order_id: orderId,
        type: 'return',
        reason: 'Item received damaged',
        items: [{ order_item_id: itemId, quantity: 1 }],
        refund_method: 'original_payment'
      }, userToken);
      assert(r.status === 201 && r.data.success, r.data.message);
      console.log(info(`Return created: ${r.data.data?.return_number}`));
    });
  }

  // ── 11. SECURITY ─────────────────────────────────────────
  console.log(head('11. SECURITY'));

  await test('Admin endpoint without token → 401', async () => {
    const r = await req('GET', '/orders/admin/all');
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  await test('Admin endpoint with user token → 403', async () => {
    const r = await req('GET', '/orders/admin/all', null, userToken);
    assert(r.status === 403, `Expected 403, got ${r.status}`);
  });

  await test('Create product without admin → 403', async () => {
    const r = await req('POST', '/products', { name: 'Hack', slug: 'hack', base_price: 0, stock: 0 }, userToken);
    assert(r.status === 403, `Expected 403, got ${r.status}`);
  });

  await test('SQL injection attempt handled', async () => {
    const r = await req('GET', "/products/'; DROP TABLE products; --");
    assert(r.status === 404 || r.status === 400, `Expected 404/400, got ${r.status}`);
  });

  // ── 12. CLEANUP ──────────────────────────────────────────
  console.log(head('12. CLEANUP'));

  await test('Delete test coupon (admin)', async () => {
    if (!adminToken) return 'skip';
    // Get coupons to find test one
    const all = await req('GET', '/coupons', null, adminToken);
    const testCoupon = all.data.data?.find(c => c.code === couponCode);
    if (!testCoupon) return 'skip';
    const r = await req('DELETE', `/coupons/${testCoupon.id}`, null, adminToken);
    assert(r.data.success, r.data.message);
  });

  await test('Remove cart item', async () => {
    if (!cartItemId) return 'skip';
    const r = await req('DELETE', `/cart/${cartItemId}`, null, userToken);
    assert(r.status === 200 && r.data.success, r.data.message);
  });

  // ── RESULTS ──────────────────────────────────────────────
  const total = results.pass + results.fail + results.skip;
  const pct   = total > 0 ? Math.round((results.pass / (results.pass + results.fail)) * 100) : 0;

  console.log(`\n${c.bold}${'═'.repeat(55)}${c.reset}`);
  console.log(`${c.bold}  RESULTS${c.reset}`);
  console.log(`${'═'.repeat(55)}`);
  console.log(`  ${c.green}Passed${c.reset}  ${results.pass}`);
  console.log(`  ${c.red}Failed${c.reset}  ${results.fail}`);
  console.log(`  ${c.yellow}Skipped${c.reset} ${results.skip}`);
  console.log(`  Total   ${total}`);
  console.log(`  Score   ${pct >= 90 ? c.green : pct >= 70 ? c.yellow : c.red}${pct}%${c.reset}`);

  if (results.errors.length > 0) {
    console.log(`\n${c.bold}${c.red}  FAILURES${c.reset}`);
    results.errors.forEach(e => {
      console.log(`  ${c.red}✗${c.reset} ${e.name}`);
      console.log(`    ${c.dim}${e.error}${c.reset}`);
    });
  }

  console.log(`\n${c.bold}${'═'.repeat(55)}${c.reset}`);
  console.log(`  Finished: ${new Date().toLocaleString()}`);
  console.log(`${c.bold}${'═'.repeat(55)}${c.reset}\n`);

  process.exit(results.fail > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error(`\n${c.red}Fatal error: ${err.message}${c.reset}`);
  process.exit(1);
});
