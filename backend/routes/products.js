// routes/products.js — Product CRUD
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyAdmin } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// GET /api/products  [PUBLIC]
// Query params: ?quality=High&size=6mm
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { quality, size } = req.query;
    let query  = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    if (quality && quality !== 'all') {
      query += ' AND quality = ?';
      params.push(quality);
    }
    if (size && size !== 'all') {
      query += ' AND size = ?';
      params.push(size);
    }

    query += ' ORDER BY quality, size';

    const [rows] = await db.query(query, params);
    res.json({ success: true, count: rows.length, products: rows });

  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/products/:id  [PUBLIC]
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE id = ?', [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT /api/products/:id/price  [ADMIN]
// ─────────────────────────────────────────
router.put('/:id/price', verifyAdmin, async (req, res) => {
  const { price } = req.body;

  if (!price || isNaN(price) || price < 100) {
    return res.status(400).json({
      success: false,
      error: 'Price must be a number ≥ 100.'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE products SET price = ?, updated_at = NOW() WHERE id = ?',
      [parseFloat(price), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    res.json({
      success: true,
      message: `✅ Price updated to ₹${parseFloat(price).toLocaleString()}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT /api/products/:id/stock  [ADMIN]
// ─────────────────────────────────────────
router.put('/:id/stock', verifyAdmin, async (req, res) => {
  const { inStock } = req.body;

  if (typeof inStock !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'inStock must be true or false.'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE products SET in_stock = ?, updated_at = NOW() WHERE id = ?',
      [inStock, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    res.json({
      success: true,
      message: `✅ Stock status updated to: ${inStock ? 'In Stock' : 'Out of Stock'}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/products/report/sales  [ADMIN]
// ─────────────────────────────────────────
router.get('/report/sales', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id, p.emoji, p.quality, p.size, p.price, p.in_stock,
        COUNT(oi.id)                        AS times_ordered,
        COALESCE(SUM(oi.quantity_kg), 0)    AS total_kg_sold,
        COALESCE(SUM(oi.subtotal), 0)       AS total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.emoji, p.quality, p.size, p.price, p.in_stock
      ORDER BY total_revenue DESC
    `);
    res.json({ success: true, report: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
