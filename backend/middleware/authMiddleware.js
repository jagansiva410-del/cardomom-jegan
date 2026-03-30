// middleware/authMiddleware.js — JWT Admin Guard
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: '🔒 Access denied. Admin token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: '❌ Invalid or expired admin token. Please login again.'
    });
  }
}

module.exports = { verifyAdmin };
