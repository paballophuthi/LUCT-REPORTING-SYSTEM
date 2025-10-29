// 📦 Import dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool } = require('./config/database');

// 🧩 Load environment variables
dotenv.config();

// 🚀 Initialize Express app
const app = express();

// 🌍 CORS Configuration - Updated with your frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  'https://luct-reporting-system-1-l1xd.onrender.com', // Your frontend
  'https://luct-reporting-system-ryh2.onrender.com'   // Your backend (for testing)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log('✅ CORS allowed for:', origin);
        callback(null, true);
      } else {
        console.log('❌ CORS blocked for:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 📦 Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🧠 Test PostgreSQL Connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('❌ Database URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');
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
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      reports: '/api/reports',
      courses: '/api/courses',
      health: '/api/health'
    }
  });
});

// 🩺 Health Check Route
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      baseUrl: `${req.protocol}://${req.get('host')}`
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// 🔍 Debug Route - List all endpoints
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

// ❌ 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/health',
      '/api/debug/routes'
    ]
  });
});

// ❌ Global 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist on this server`,
    availableRoutes: ['/', '/health', '/api']
  });
});

// ⚠️ Global Error Handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Request blocked by CORS policy',
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 🚦 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('-----------------------------------------');
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Loaded ✅' : 'Missing ⚠️'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Base API: http://localhost:${PORT}/api`);
  console.log(`🌍 Frontend URL: https://luct-reporting-system-1-l1xd.onrender.com`);
  console.log(`🔧 Backend URL: https://luct-reporting-system-ryh2.onrender.com`);
  console.log('-----------------------------------------');
});

module.exports = app;