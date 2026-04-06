const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// Ensure table exists (runs once on first request)
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(255) NOT NULL,
      phone      VARCHAR(20),
      subject    VARCHAR(100),
      message    TEXT NOT NULL,
      status     VARCHAR(20) DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  tableReady = true;
}

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    await ensureTable();
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim())    return res.status(400).json({ success: false, message: 'Name is required' });
    if (!email?.trim())   return res.status(400).json({ success: false, message: 'Email is required' });
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });
    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ success: false, message: 'Invalid email address' });
    if (message.length > 2000) return res.status(400).json({ success: false, message: 'Message too long' });

    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, subject?.trim() || null, message.trim()]
    );

    console.log(`📬 Contact message #${result.rows[0].id} from ${email}`);
    res.status(201).json({ success: true, message: 'Message received. We will reply within 24 hours.' });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;
