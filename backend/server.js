// 📦 Import dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool } = require('./config/database');

// 🧩 Load environment variables
dotenv.config();

// 🚀 Initialize Express app
const app = express();

// 🌍 Middleware
app.use(express.json({ limit: '10mb' }));

// ✅ Configure CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000', // For local and deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// 🧠 Test PostgreSQL Connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
})();

// 🧭 API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/download', require('./routes/download'));
app.use('/api/monitoring', require('./routes/monitoring'));
app.use('/api/signatures', require('./routes/signatures'));

// 🏠 Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Welcome to the Limkokwing Reporting System API',
    status: 'Server is running successfully',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 🩺 Health Check Route
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: 'Database connection failed',
    });
  }
});

// 🚦 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('-----------------------------------------');
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Loaded ✅' : 'Missing ⚠️'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Base API: http://localhost:${PORT}/api`);
  console.log('-----------------------------------------');
});
