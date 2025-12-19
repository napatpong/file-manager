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
// Load .env.production or .env based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, envFile) });

// Now import other modules after env is loaded
import db from './database/init.js';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 5000;

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
// Trust proxy and allow X-Forwarded headers
app.set('trust proxy', true);

// Request logging middleware - log ALL requests
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Content-Length: ${req.headers['content-length']}`);
  }
  next();
});

// CORS configuration - allow all origins
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-file-id', 'x-chunk-index', 'x-total-chunks', 'x-chunk-size'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Increase body size limit to unlimited for large file uploads
app.use(express.json({ limit: '50gb' }));
app.use(express.urlencoded({ limit: '50gb', extended: true }));

// Routes
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

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Check if SSL certificates exist
const sslKeyPath = path.join(__dirname, '..', 'ssl', 'itc.in.th.key');
const sslCertPath = path.join(__dirname, '..', 'ssl', 'itc.in.th.crt');
const useSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

let server;
if (useSSL) {
  // HTTPS server with self-signed certificate
  const httpsOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
  };
  
  server = https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🔒 HTTPS Server is running on port ${PORT}`);
    console.log(`Database initialized at ${process.env.DATABASE_PATH}`);
    console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || './uploads'}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
    console.log(`⚠️  Using self-signed certificate`);
  });
} else {
  // HTTP server (fallback)
  server = app.listen(PORT, () => {
    console.log(`⚠️  HTTP Server is running on port ${PORT} (SSL certificates not found)`);
    console.log(`Database initialized at ${process.env.DATABASE_PATH}`);
    console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || './uploads'}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
    console.log(`💡 To enable HTTPS, run: npm run generate-ssl`);
  });
}

// Set timeout for large file uploads (30 minutes)
server.setTimeout(1800000); // 30 minutes
server.keepAliveTimeout = 1800000;
server.headersTimeout = 1900000;

// Handle socket timeout
server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    return;
  }
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
