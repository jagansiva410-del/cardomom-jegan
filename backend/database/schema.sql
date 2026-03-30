-- ═══════════════════════════════════════════════════════
--  Elachi Cardamom Inventory System — Database Schema
--  Run this file once to create all tables
--  Command: mysql -u root -p < database/schema.sql
-- ═══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS cardamom_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cardamom_db;

-- ─────────────────────────────────────────
-- TABLE 1: products
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  quality     ENUM('Low','Medium','High','Organic') NOT NULL,
  size        ENUM('4mm','6mm','9mm','12mm') NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  in_stock    BOOLEAN DEFAULT TRUE,
  emoji       VARCHAR(10) CHARACTER SET utf8mb4 DEFAULT '🌿',
  description TEXT CHARACTER SET utf8mb4,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- TABLE 2: customers
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  address    TEXT NOT NULL,
  phone      VARCHAR(20) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- TABLE 3: orders
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id             VARCHAR(20) PRIMARY KEY,
  customer_id    INT NOT NULL,
  total_amount   DECIMAL(10,2) NOT NULL,
  payment_method ENUM('COD') DEFAULT 'COD',
  status         ENUM('Processing','Shipped','Delivered') DEFAULT 'Processing',
  order_date     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- TABLE 4: order_items
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    VARCHAR(20) NOT NULL,
  product_id  INT NOT NULL,
  quantity_kg DECIMAL(6,2) NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(10,2) AS (quantity_kg * unit_price) STORED,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ─────────────────────────────────────────
-- TABLE 5: admins
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100),
  last_login    DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- SEED: Products (16 products)
-- ─────────────────────────────────────────
INSERT INTO products (quality, size, price, in_stock, emoji, description) VALUES
('Low',    '4mm',  800,  TRUE,  '🫛', 'Economy grade, ideal for everyday cooking'),
('Low',    '6mm',  950,  TRUE,  '🫛', 'Economy grade, slightly larger pods'),
('Low',    '9mm',  1100, FALSE, '🫛', 'Economy grade, larger size'),
('Low',    '12mm', 1200, TRUE,  '🫛', 'Economy large pods'),
('Medium', '4mm',  1300, TRUE,  '🌱', 'Good fragrance, popular for chai'),
('Medium', '6mm',  1500, TRUE,  '🌱', 'Balanced aroma and size'),
('Medium', '9mm',  1750, TRUE,  '🌱', 'Bold flavor, great for biryani'),
('Medium', '12mm', 2000, FALSE, '🌱', 'Large pods, premium medium grade'),
('High',   '4mm',  1900, TRUE,  '🌿', 'High-grade small pods for grinding'),
('High',   '6mm',  2200, TRUE,  '🌿', 'Superior aroma, export quality'),
('High',   '9mm',  2600, TRUE,  '🌿', 'Intense flavor, prized by chefs'),
('High',   '12mm', 3100, TRUE,  '🌿', 'Jumbo pods, finest fragrance'),
('Organic','4mm',  2800, TRUE,  '🍃', 'Certified organic small pods'),
('Organic','6mm',  3400, TRUE,  '🍃', 'Certified organic, chemical-free'),
('Organic','9mm',  3900, TRUE,  '🍃', 'Large organic pods, rich flavor'),
('Organic','12mm', 4500, FALSE, '🍃', 'Premium organic jumbo, gift-worthy');

-- NOTE: Admin user is seeded via: node seed-admin.js
-- This inserts: username=jegan, password=jegan@2005 (bcrypt hashed)
