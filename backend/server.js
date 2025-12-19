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
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const result = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', 'admin@filemanager.com', hashedPassword, 'admin');

    db.prepare(`
      INSERT INTO user_permissions (userId, canUpload, canDownload, canManage)
      VALUES (?, ?, ?, ?)
    `).run(result.lastInsertRowid, 1, 1, 1);

    console.log('✓ Admin user created: admin / admin123');
  }
}

initializeAdminUser();

// Middleware
// Trust proxy and allow X-Forwarded headers
app.set('trust proxy', true);

// Add request logging middleware for large uploads
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/upload')) {
    console.log('[SERVER] 🔵 === NEW REQUEST ===');
    console.log('[SERVER] 📝 Method:', req.method);
    console.log('[SERVER] 📝 Path:', req.path);
    console.log('[SERVER] 📝 Content-Type:', req.headers['content-type']);
    console.log('[SERVER] 📝 Content-Length:', req.headers['content-length']);
    console.log('[SERVER] 📝 Auth Header:', req.headers['authorization'] ? 'Present' : 'Missing');
  }
  next();
});

// CORS configuration - allow all origins
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-file-id', 'x-chunk-index', 'x-total-chunks', 'x-chunk-size']
}));
// Increase body size limit to 2GB for large file uploads
app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ limit: '2gb', extended: true }));

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

// Set timeout for large file uploads (10 minutes)
server.setTimeout(600000);
server.keepAliveTimeout = 600000;
server.headersTimeout = 700000;
