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
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, 'public')));

// ── ROUTES ──
app.use('/api/auth',      authRoutes);
app.use('/api',           apiRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
