import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database/init.js';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import userRoutes from './routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
// First load .env.production or .env based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, envFile) });

// Then load .env to override/supplement with local values
dotenv.config({ path: path.join(__dirname, '.env') });

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

// CORS configuration - allow all origins
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Increase body size limit to 1GB for large file uploads
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));

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

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database initialized at ${process.env.DATABASE_PATH}`);
  console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || './uploads'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});

// Set timeout for large file uploads (10 minutes)
server.setTimeout(600000);
