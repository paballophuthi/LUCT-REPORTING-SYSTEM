// 📦 Import dependencies
const { Pool } = require('pg');
const dotenv = require('dotenv');

// 🧩 Load environment variables
dotenv.config();

// 🗄️ Create PostgreSQL connection pool using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render-hosted PostgreSQL
  },
});

// 🧠 Log connection info (safe for debugging)
pool.on('connect', () => {
  console.log('✅ PostgreSQL connection pool initialized');
});

// ❌ Handle connection errors gracefully
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err.message);
  process.exit(-1);
});

// 🧩 Export the pool for use in your app
module.exports = { pool };
