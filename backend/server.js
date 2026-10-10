require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');

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
const blogRoutes      = require('./routes/blogRoutes');
const swaggerUi       = require('swagger-ui-express');
const swaggerDoc      = require('./docs/swagger.json');

const app = express();
const PORT = process.env.PORT || 5000;

// ── DATABASE ──
connectDB();

// ── HTTP COMPRESSION & PROTOCOL HEADERS ──
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses larger than 1KB
}));

// Alt-Svc header advertising HTTP/2 and HTTP/3 support
app.use((req, res, next) => {
  res.setHeader('Alt-Svc', 'h3=":443"; ma=86400, h2=":443"; ma=86400');
  next();
});

// ── MIDDLEWARE ──
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'https://taqnik.com',
  'https://www.careerforgeai.com',
  'https://careernest.taqnik.in',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true); // Fallback to permissive to avoid breaking existing users
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── STATIC & SEO ROUTES ──
const fs = require('fs');
const isProd = process.env.NODE_ENV === 'production';
const staticDir = (isProd && fs.existsSync(path.join(__dirname, '../dist')))
  ? path.join(__dirname, '../dist')
  : path.join(__dirname, '../client');

app.get('/robots.txt', (req, res) => {
  const robotsFile = path.join(staticDir, 'robots.txt');
  res.type('text/plain').set('Cache-Control', 'public, max-age=86400, s-maxage=86400').sendFile(robotsFile);
});

app.get('/sitemap.xml', (req, res) => {
  const sitemapFile = path.join(staticDir, 'sitemap.xml');
  res.type('application/xml').set('Cache-Control', 'public, max-age=86400, s-maxage=86400').sendFile(sitemapFile);
});

app.use(express.static(staticDir, { extensions: ['html'], maxAge: '1d' }));

// ── ROUTES ──
app.use('/api/auth',      authRoutes);
app.use('/api/leads',     leadRoutes);
app.use('/api/roadmap',   roadmapRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/insights',  insightsRoutes);
app.use('/api/blog',      blogRoutes);
app.get('/api/docs/swagger.json', (req, res) => res.json(swaggerDoc));
app.use('/api/docs',      swaggerUi.serve, swaggerUi.setup(swaggerDoc));
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
