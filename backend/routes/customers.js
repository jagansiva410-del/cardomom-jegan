// routes/customers.js — Customer Data (Admin only)
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyAdmin } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// GET /api/customers  [ADMIN]
// ─────────────────────────────────────────
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.*,
        COUNT(o.id)                   AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, count: rows.length, customers: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/customers/:id/orders  [ADMIN]
// ─────────────────────────────────────────
router.get('/:id/orders', verifyAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, c.name, c.email, c.phone, c.address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE c.id = ?
      ORDER BY o.order_date DESC
    `, [req.params.id]);

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
