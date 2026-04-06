const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories
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

// POST /api/categories
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, slug, description, image_url, sort_order } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'Name and slug are required' });
    const result = await pool.query(
      'INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, slug, description || null, image_url || null, sort_order || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Category slug already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/categories/:id
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, slug, description, image_url, sort_order, is_active } = req.body;
    const result = await pool.query(
      `UPDATE categories
       SET name=$1, slug=$2, description=$3, image_url=$4, sort_order=$5, is_active=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, slug, description || null, image_url || null, sort_order || 0, is_active !== false, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Category slug already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/categories/:id  (soft delete)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE categories SET is_active=false, updated_at=NOW() WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
