const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, slug, description, image_url, sort_order } = req.body;
    const result = await pool.query(
      'INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, slug, description, image_url, sort_order || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
