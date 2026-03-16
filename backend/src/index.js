require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Jewelry Store API is running 💎', timestamp: new Date() });
});

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/auth',       require('./routes/admin'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart',       require('./routes/cart'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/payment',    require('./routes/payment'));
app.use('/api/wishlist',   require('./routes/wishlist'));
app.use('/api/shiprocket', require('./routes/shiprocket'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/returns',   require('./routes/returns'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   💎 Jewelry Store API Running       ║
  ║   Port: ${PORT}                          ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
