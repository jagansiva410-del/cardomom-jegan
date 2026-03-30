// server.js — Elachi Cardamom Inventory System — Main Server
const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');
require('dotenv').config();

const app = express();

// ─────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ─────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────
app.use('/api/products',  require('./routes/products'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/admin',     require('./routes/admin'));

// ─────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌿 Elachi Cardamom API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ─────────────────────────────────────────
// Serve frontend for all non-API routes
// ─────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ─────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('🌿 ═══════════════════════════════════════');
  console.log('   Elachi Cardamom Inventory System');
  console.log('🌿 ═══════════════════════════════════════');
  console.log(`🚀  Server   : http://localhost:${PORT}`);
  console.log(`🌐  Frontend : http://localhost:${PORT}`);
  console.log(`📡  API Base : http://localhost:${PORT}/api`);
  console.log(`❤️   Health   : http://localhost:${PORT}/api/health`);
  console.log('🌿 ═══════════════════════════════════════');
  console.log('');
});
