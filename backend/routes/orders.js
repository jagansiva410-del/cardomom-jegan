// routes/orders.js — Order Management
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyAdmin } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// POST /api/orders  [PUBLIC] — Place new order
// ─────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, address, phone, email, items } = req.body;

  // Validation
  if (!name || !address || !phone || !email) {
    return res.status(400).json({
      success: false,
      error: 'Please provide name, address, phone, and email.'
    });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Cart is empty. Add items before placing an order.'
    });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert customer
    const [custResult] = await connection.query(
      'INSERT INTO customers (name, address, phone, email) VALUES (?, ?, ?, ?)',
      [name.trim(), address.trim(), phone.trim(), email.trim()]
    );
    const customerId = custResult.insertId;

    // 2. Verify products exist and are in stock + calculate total
    let total = 0;
    for (const item of items) {
      const [productRows] = await connection.query(
        'SELECT id, price, in_stock FROM products WHERE id = ?', [item.id]
      );
      if (!productRows.length) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: `Product ID ${item.id} not found.`
        });
      }
      if (!productRows[0].in_stock) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: `Product ID ${item.id} is out of stock.`
        });
      }
      total += productRows[0].price * item.qty;
    }

    // 3. Generate unique order ID
    const orderId = 'ELI-' + Date.now().toString().slice(-6);

    // 4. Insert order
    await connection.query(
      `INSERT INTO orders (id, customer_id, total_amount, payment_method, status)
       VALUES (?, ?, ?, 'COD', 'Processing')`,
      [orderId, customerId, total]
    );

    // 5. Insert all order items
    for (const item of items) {
      const [productRows] = await connection.query(
        'SELECT price FROM products WHERE id = ?', [item.id]
      );
      const unitPrice = productRows[0].price;
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity_kg, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.qty, unitPrice]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: '✅ Order placed successfully!',
      orderId,
      total,
      status: 'Processing',
      paymentMethod: 'Cash on Delivery'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Place order error:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// ─────────────────────────────────────────
// GET /api/orders  [ADMIN] — All orders
// ─────────────────────────────────────────
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT
        o.id, o.order_date, o.status, o.total_amount, o.payment_method, o.updated_at,
        c.name AS customer_name, c.email, c.phone, c.address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.order_date DESC
    `);

    // Attach items to each order
    for (const order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.quality, p.size, p.emoji
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/orders/:id  [PUBLIC] — Receipt
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [orderRows] = await db.query(`
      SELECT o.*, c.name, c.address, c.phone, c.email
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `, [req.params.id]);

    if (!orderRows.length) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const [items] = await db.query(`
      SELECT oi.*, p.quality, p.size, p.emoji
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      order: orderRows[0],
      items
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
