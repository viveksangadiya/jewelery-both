const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

// ════════════════════════════════════════════════════════
// GET /api/reviews/:productId  — get all approved reviews for a product
// ════════════════════════════════════════════════════════
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT
        r.id, r.rating, r.title, r.comment,
        r.created_at,
        u.name AS user_name,
        u.avatar_url AS user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [productId, limit, offset]);

    // Rating summary
    const summary = await pool.query(`
      SELECT
        COUNT(*) AS total,
        ROUND(AVG(rating)::numeric, 1) AS avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) AS five,
        COUNT(CASE WHEN rating = 4 THEN 1 END) AS four,
        COUNT(CASE WHEN rating = 3 THEN 1 END) AS three,
        COUNT(CASE WHEN rating = 2 THEN 1 END) AS two,
        COUNT(CASE WHEN rating = 1 THEN 1 END) AS one
      FROM reviews
      WHERE product_id = $1 AND is_approved = true
    `, [productId]);

    res.json({
      success: true,
      data: result.rows,
      summary: summary.rows[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(summary.rows[0].total),
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/reviews/:productId/my  — check if current user has reviewed
// ════════════════════════════════════════════════════════
router.get('/:productId/my', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2',
      [req.params.productId, req.user.id]
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/reviews/:productId/can-review  — check if user purchased
// ════════════════════════════════════════════════════════
router.get('/:productId/can-review', authenticate, async (req, res) => {
  try {
    const purchased = await pool.query(`
      SELECT oi.id FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = $1
        AND o.user_id = $2
        AND o.status IN ('delivered', 'confirmed', 'processing', 'shipped')
      LIMIT 1
    `, [req.params.productId, req.user.id]);

    res.json({ success: true, data: { purchased: purchased.rows.length > 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/reviews/:productId  — submit a review (login required)
// ════════════════════════════════════════════════════════
router.post('/:productId', authenticate, async (req, res) => {
  const { rating, title, comment } = req.body;
  const { productId } = req.params;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }

  try {
    // Check product exists
    const product = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND is_active = true',
      [productId]
    );
    if (product.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check user has actually purchased this product (delivered order)
    const purchased = await pool.query(`
      SELECT oi.id FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = $1
        AND o.user_id = $2
        AND o.status IN ('delivered', 'confirmed', 'processing', 'shipped')
      LIMIT 1
    `, [productId, req.user.id]);

    if (purchased.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only review products you have purchased.',
        code: 'NOT_PURCHASED',
      });
    }

    // Check if user already reviewed — upsert
    const existing = await pool.query(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [productId, req.user.id]
    );

    let review;
    if (existing.rows.length > 0) {
      // Update existing
      const result = await pool.query(`
        UPDATE reviews
        SET rating=$1, title=$2, comment=$3, updated_at=NOW()
        WHERE product_id=$4 AND user_id=$5
        RETURNING *
      `, [rating, title || null, comment || null, productId, req.user.id]);
      review = result.rows[0];
    } else {
      // Insert new
      const result = await pool.query(`
        INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING *
      `, [productId, req.user.id, rating, title || null, comment || null]);
      review = result.rows[0];
    }

    res.status(201).json({ success: true, data: review, message: 'Review submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// DELETE /api/reviews/:productId  — delete own review
// ════════════════════════════════════════════════════════
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM reviews WHERE product_id = $1 AND user_id = $2',
      [req.params.productId, req.user.id]
    );
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
