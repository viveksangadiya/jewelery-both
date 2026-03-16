const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

// All wishlist routes require login
router.use(authenticate);

// ════════════════════════════════════════════════════════
// GET /api/wishlist  — get user's full wishlist with product details
// ════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        w.id AS wishlist_id,
        w.created_at AS wishlisted_at,
        p.id, p.name, p.slug, p.base_price, p.sale_price,
        p.material, p.stock, p.is_active,
        ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
        COUNT(DISTINCT r.id) AS review_count,
        pi.image_url AS primary_image
      FROM wishlists w
      JOIN products p ON p.id = w.product_id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE w.user_id = $1
      GROUP BY w.id, w.created_at, p.id, p.name, p.slug, p.base_price, p.sale_price, p.material, p.stock, p.is_active, pi.image_url
      ORDER BY w.created_at DESC
    `, [req.user.id]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/wishlist/ids  — get just the product IDs (fast, for UI state)
// ════════════════════════════════════════════════════════
router.get('/ids', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT product_id FROM wishlists WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows.map(r => r.product_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/wishlist/toggle  — add or remove a product
// ════════════════════════════════════════════════════════
router.post('/toggle', async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ success: false, message: 'product_id required' });

  try {
    // Check if already wishlisted
    const existing = await pool.query(
      'SELECT id FROM wishlists WHERE user_id=$1 AND product_id=$2',
      [req.user.id, product_id]
    );

    if (existing.rows.length > 0) {
      // Remove
      await pool.query(
        'DELETE FROM wishlists WHERE user_id=$1 AND product_id=$2',
        [req.user.id, product_id]
      );
      res.json({ success: true, wishlisted: false, message: 'Removed from wishlist' });
    } else {
      // Add
      await pool.query(
        'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)',
        [req.user.id, product_id]
      );
      res.json({ success: true, wishlisted: true, message: 'Added to wishlist' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// DELETE /api/wishlist/:productId  — explicit remove
// ════════════════════════════════════════════════════════
router.delete('/:productId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlists WHERE user_id=$1 AND product_id=$2',
      [req.user.id, req.params.productId]
    );
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// DELETE /api/wishlist  — clear entire wishlist
// ════════════════════════════════════════════════════════
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM wishlists WHERE user_id=$1', [req.user.id]);
    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
