const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin: Get all customers
router.get('/admin/customers', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
        COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
