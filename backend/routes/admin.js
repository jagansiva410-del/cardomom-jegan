// routes/admin.js — Admin Authentication & Dashboard
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { verifyAdmin } = require('../middleware/authMiddleware');
require('dotenv').config();

// ─────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required.'
    });
  }

  try {
    // Find admin by username
    const [rows] = await db.query(
      'SELECT * FROM admins WHERE username = ?', [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Username not recognised. Please check and try again.'
      });
    }

    const admin = rows[0];

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password. Please try again.'
      });
    }

    // Update last login timestamp
    await db.query(
      'UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, fullName: admin.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      success: true,
      message: '✅ Login successful. Welcome, ' + admin.full_name,
      token,
      admin: {
        id:       admin.id,
        username: admin.username,
        fullName: admin.full_name,
        lastLogin: admin.last_login
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error during login.' });
  }
});

// ─────────────────────────────────────────
// GET /api/admin/dashboard  [PROTECTED]
// ─────────────────────────────────────────
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM orders)                                  AS total_orders,
        (SELECT COUNT(*) FROM orders WHERE status != 'Delivered')      AS pending_deliveries,
        (SELECT COUNT(*) FROM orders WHERE status = 'Delivered')       AS delivered_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'Shipped')         AS shipped_orders,
        (SELECT COUNT(*) FROM products WHERE in_stock = TRUE)          AS products_in_stock,
        (SELECT COUNT(*) FROM products WHERE in_stock = FALSE)         AS products_out_of_stock,
        (SELECT COUNT(*) FROM customers)                               AS total_customers,
        (SELECT COALESCE(SUM(total_amount),0) FROM orders)             AS total_revenue
    `);

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT /api/admin/order/:id/status  [PROTECTED]
// ─────────────────────────────────────────
router.put('/order/:id/status', verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Processing', 'Shipped', 'Delivered'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be: Processing, Shipped, or Delivered.'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    res.json({
      success: true,
      message: `✅ Order ${req.params.id} status updated to "${status}"`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/admin/verify  [PROTECTED] — token check
// ─────────────────────────────────────────
router.get('/verify', verifyAdmin, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = router;
