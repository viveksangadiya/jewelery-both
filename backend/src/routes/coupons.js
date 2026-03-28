const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');

// ── GET /api/coupons  (Admin) ─────────────────────────────
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM coupons ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/coupons  (Admin - create) ───────────────────
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { code, type, value, min_order_value = 0, max_discount, usage_limit, expires_at } = req.body;
    if (!code || !type || !value) {
      return res.status(400).json({ success: false, message: 'code, type, and value are required' });
    }
    const result = await pool.query(`
      INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [code.toUpperCase().trim(), type, value, min_order_value, max_discount || null, usage_limit || null, expires_at || null]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/coupons/:id  (Admin - update) ────────────────
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { code, type, value, min_order_value, max_discount, usage_limit, expires_at, is_active } = req.body;
    const result = await pool.query(`
      UPDATE coupons SET
        code = COALESCE($1, code),
        type = COALESCE($2, type),
        value = COALESCE($3, value),
        min_order_value = COALESCE($4, min_order_value),
        max_discount = $5,
        usage_limit = $6,
        expires_at = $7,
        is_active = COALESCE($8, is_active)
      WHERE id = $9 RETURNING *
    `, [code?.toUpperCase(), type, value, min_order_value, max_discount || null,
        usage_limit || null, expires_at || null, is_active, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── DELETE /api/coupons/:id  (Admin) ─────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM coupons WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
