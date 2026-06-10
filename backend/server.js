require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const { startPriceChecker } = require('./services/priceChecker');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AlertCart',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Catch-all: serve frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 AlertCart server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 API:       http://localhost:${PORT}/api/products`);
  console.log(`❤️  Health:    http://localhost:${PORT}/health\n`);

  // Start cron-based price checker
  startPriceChecker();
});

module.exports = app;
