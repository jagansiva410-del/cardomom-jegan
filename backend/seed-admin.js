// seed-admin.js — Run once to create the admin user
// Usage: node seed-admin.js

const bcrypt = require('bcryptjs');
const db     = require('./config/db');
require('dotenv').config();

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    // Check if admin already exists
    const [existing] = await db.query(
      'SELECT id FROM admins WHERE username = ?', ['jegan']
    );

    if (existing.length > 0) {
      console.log('⚠️  Admin user "jegan" already exists. Skipping.');
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash('jegan@2005', 12);

    // Insert admin
    await db.query(
      `INSERT INTO admins (username, password_hash, full_name)
       VALUES (?, ?, ?)`,
      ['jegan', passwordHash, 'Jegan (Administrator)']
    );

    console.log('✅  Admin user created successfully!');
    console.log('    Username : jegan');
    console.log('    Password : jegan@2005');
    console.log('    Role     : Administrator');
    process.exit(0);

  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  }
}

seedAdmin();
