const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, isAdmin };
