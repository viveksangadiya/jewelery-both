const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get cart
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ci.id, ci.quantity, ci.product_id, ci.variant_id,
        p.name, p.slug, p.base_price, p.sale_price, p.stock,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image,
        pv.name as variant_name, pv.value as variant_value, pv.price_modifier
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = $1
    `, [req.user.id]);

    const items = result.rows.map(item => ({
      ...item,
      effective_price: parseFloat(item.sale_price || item.base_price) + parseFloat(item.price_modifier || 0)
    }));

    const subtotal = items.reduce((sum, item) => sum + item.effective_price * item.quantity, 0);
    res.json({ success: true, data: { items, subtotal } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to cart
router.post('/add', authenticate, async (req, res) => {
  try {
    const { product_id, variant_id, quantity = 1 } = req.body;
    const existing = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id=$1 AND product_id=$2 AND (variant_id=$3 OR (variant_id IS NULL AND $3 IS NULL))',
      [req.user.id, product_id, variant_id || null]
    );
    if (existing.rows.length > 0) {
      await pool.query('UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2', [quantity, existing.rows[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES ($1,$2,$3,$4)',
        [req.user.id, product_id, variant_id || null, quantity]
      );
    }
    res.json({ success: true, message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update quantity
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    } else {
      await pool.query('UPDATE cart_items SET quantity=$1 WHERE id=$2 AND user_id=$3', [quantity, req.params.id, req.user.id]);
    }
    res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove from cart
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Clear cart
router.delete('/', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
