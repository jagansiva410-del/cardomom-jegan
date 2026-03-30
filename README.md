# 🌿 Elachi — Cardamom Inventory Management System

A full-stack web application for managing cardamom inventory with a nature-inspired theme.

---

## 🏗️ Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend  | Node.js + Express.js          |
| Database | MySQL                         |
| Auth     | JWT + bcryptjs                |

---

## 📁 Project Structure

```
cardamom-project/
├── frontend/
│   └── index.html              ← Full UI (served by Express)
│
└── backend/
    ├── server.js               ← Main Express server
    ├── seed-admin.js           ← Creates admin user in DB
    ├── .env                    ← Environment variables
    ├── package.json
    ├── config/
    │   └── db.js               ← MySQL connection pool
    ├── database/
    │   └── schema.sql          ← All CREATE TABLE + seed data
    ├── middleware/
    │   └── authMiddleware.js   ← JWT verification
    └── routes/
        ├── admin.js            ← Login, dashboard, order status
        ├── products.js         ← List, price update, stock toggle
        ├── orders.js           ← Place order, list orders, receipt
        └── customers.js        ← Customer data (admin only)
```

---

## 🚀 Setup Instructions

### Step 1 — Install MySQL & Create Database

```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source /path/to/cardamom-project/backend/database/schema.sql
# OR
mysql -u root -p < backend/database/schema.sql
```

### Step 2 — Configure Environment

Edit `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD   ← change this
DB_NAME=cardamom_db
JWT_SECRET=elachi_cardamom_secret_key_2025
JWT_EXPIRES_IN=1d
```

### Step 3 — Install Dependencies

```bash
cd backend
npm install
```

### Step 4 — Seed Admin User

```bash
node seed-admin.js
```

This creates:
- **Username:** `jegan`
- **Password:** `jegan@2005`

### Step 5 — Start the Server

```bash
node server.js
# OR for auto-reload during development:
npm run dev
```

### Step 6 — Open in Browser

```
http://localhost:5000
```

---

## 🔌 API Endpoints

| Method | Endpoint                        | Auth   | Description              |
|--------|---------------------------------|--------|--------------------------|
| GET    | `/api/health`                   | Public | Server health check      |
| GET    | `/api/products`                 | Public | List products (filterable)|
| PUT    | `/api/products/:id/price`       | Admin  | Update price             |
| PUT    | `/api/products/:id/stock`       | Admin  | Toggle stock status      |
| POST   | `/api/orders`                   | Public | Place new order          |
| GET    | `/api/orders`                   | Admin  | List all orders          |
| GET    | `/api/orders/:id`               | Public | Get order receipt        |
| POST   | `/api/admin/login`              | Public | Admin login → JWT token  |
| GET    | `/api/admin/dashboard`          | Admin  | Dashboard stats          |
| PUT    | `/api/admin/order/:id/status`   | Admin  | Update delivery status   |

---

## 🔐 Admin Login

| Field    | Value       |
|----------|-------------|
| Username | `jegan`     |
| Password | `jegan@2005`|

---

## 🗄️ Database Tables

1. **products** — Cardamom products (quality, size, price, stock)
2. **customers** — Customer details from orders
3. **orders** — Order records with status
4. **order_items** — Line items linking orders to products
5. **admins** — Admin user with hashed password

---

## ⚠️ Offline / Demo Mode

If the backend is not running, the frontend automatically falls back to
**demo data** so the UI remains functional for testing purposes.

---

## 🌿 Features

- Browse cardamom by quality (Low/Medium/High/Organic) and size (4mm–12mm)
- Add to cart, adjust quantities, place order with customer details
- Cash on Delivery payment, order receipt with download
- Admin panel: update prices, toggle stock, manage delivery statuses
- Admin login protected by JWT (bcrypt hashed password)
