const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AutoExam Pro API is running' });
});

// Database connection test endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      message: 'Database connected', 
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const { verifyToken } = require('./middleware/auth');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', verifyToken, courseRoutes);

// 404 handler - must come before error handler
app.use((req, res, next) => {
  res.status(404).json({ 
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  if (process.env.NODE_ENV === 'development' || statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({ 
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 DB Health check: http://localhost:${PORT}/api/health/db`);
});
