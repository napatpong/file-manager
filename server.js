import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before importing routes
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, envFile) });

// Now import other modules after env is loaded
import db from './backend/database/init.js';
import authRoutes from './backend/routes/auth.js';
import fileRoutes from './backend/routes/files.js';
import userRoutes from './backend/routes/users.js';

const app = express();
const PORT = process.env.PORT || 2087;
const HTTP_PORT = process.env.HTTP_PORT || 2086;

// Auto-seed database on startup
function initializeAdminUser() {
  const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('*#482Admin#', 10);
    const result = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', 'it-admin@itc-group.co.th', hashedPassword, 'admin');

    db.prepare(`
      INSERT INTO user_permissions (userId, canUpload, canDownload, canManage)
      VALUES (?, ?, ?, ?)
    `).run(result.lastInsertRowid, 1, 1, 1);

    console.log('✓ Admin user created: admin / *#482Admin#');
  }
}

initializeAdminUser();

// Middleware
app.set('trust proxy', true);

// Request logging middleware
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Content-Length: ${req.headers['content-length']}`);
  }
  next();
});

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-file-id', 'x-chunk-index', 'x-total-chunks', 'x-chunk-size'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response'],
  optionsSuccessStatus: 200
}));

app.options('*', cors());

// Increase body size limit
app.use(express.json({ limit: '50gb' }));
app.use(express.urlencoded({ limit: '50gb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running',
    jwtSecretDefined: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
});

// Serve frontend static files - MUST be after API routes
const frontendDistPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // SPA routing - send index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.warn('⚠️  Frontend dist directory not found. Run "npm run build" to build frontend.');
  // Fallback for development
  app.get('*', (req, res) => {
    res.status(404).json({ message: 'Frontend not built. Run "npm run build"' });
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Check if SSL certificates exist
const sslKeyPath = path.join(__dirname, 'ssl', 'itc.in.th.key');
const sslCertPath = path.join(__dirname, 'ssl', 'itc.in.th.crt');
const useSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

let server;
if (useSSL) {
  // HTTPS server
  const httpsOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
  };
  
  server = https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🔒 HTTPS Server is running on port ${PORT}`);
    console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || './uploads'}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  });

  // Also start HTTP server
  app.listen(HTTP_PORT, () => {
    console.log(`ℹ️  HTTP Server is running on port ${HTTP_PORT}`);
  });
} else {
  // HTTP server only
  server = app.listen(PORT, () => {
    console.log(`⚠️  HTTP Server is running on port ${PORT}`);
    console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || './uploads'}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  });
}

// Set timeout
server.setTimeout(1800000);
server.keepAliveTimeout = 1800000;
server.headersTimeout = 1900000;

server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    return;
  }
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
