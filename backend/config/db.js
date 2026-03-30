// config/db.js — MySQL Connection Pool
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'cardamom_db',
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
  timezone:         '+05:30',
  // ✅ FIX: mysql2 requires the full collation string (not just 'utf8mb4')
  // Without this, mysql2 falls back to latin1 and emojis return as ???
  charset:          'UTF8MB4_UNICODE_CI'
});

const db = pool.promise();

// ✅ FIX: Force utf8mb4 on every new connection so emojis are preserved end-to-end
pool.on('connection', (connection) => {
  connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
});

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌  Database connection FAILED:', err.message);
    console.error('👉  Check your .env DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
  } else {
    console.log('✅  MySQL connected → database:', process.env.DB_NAME);
    connection.release();
  }
});

module.exports = db;
