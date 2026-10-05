require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes       = require('./routes/api');
const authRoutes      = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const leadRoutes      = require('./routes/leadRoutes');
const roadmapRoutes   = require('./routes/roadmapRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const paymentRoutes   = require('./routes/paymentRoutes');
const insightsRoutes  = require('./routes/insightsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── DATABASE ──
connectDB();

// ── MIDDLEWARE ──
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── STATIC FILES ──
app.use(express.static(path.join(__dirname, '../client'), { extensions: ['html'] }));

// ── ROUTES ──
app.use('/api/auth',      authRoutes);
app.use('/api/leads',     leadRoutes);
app.use('/api/roadmap',   roadmapRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/insights',  insightsRoutes);
app.use('/api',           apiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── 404 HANDLER FOR UNMATCHED ROUTES ──
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.status(404).sendFile(path.join(__dirname, '../client/404.html'));
  }
  res.status(404).json({ success: false, error: 'Resource not found' });
});

// ── ERROR HANDLER ──
app.use(errorHandler);

// ── START ──
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer(PORT);
