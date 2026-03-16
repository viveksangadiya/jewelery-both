const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ============================================================
// ONE-TIME ADMIN SEED — hit GET /api/auth/seed-admin once,
// then DELETE this route block and restart the server.
// ============================================================
router.get('/seed-admin', async (req, res) => {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role, is_verified)
       VALUES ('Admin User', 'admin@jewelrystore.com', $1, 'admin', true)
       ON CONFLICT (email) DO UPDATE SET password = $1, role = 'admin', is_verified = true`,
      [hash]
    );
    res.json({ success: true, message: 'Admin ready. Email: admin@jewelrystore.com | Pass: Admin@123' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, phone]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ success: true, message: 'Registration successful', data: { user, token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: { user: userWithoutPassword, token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, phone',
      [name, phone, req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;