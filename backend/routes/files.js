import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';
import db from '../database/init.js';
import auth from '../middleware/auth.js';
import checkRole from '../middleware/checkRole.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Use UPLOAD_DIR from environment, fallback to local ./uploads
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Custom multer to ensure UTF-8 filename handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB limit
  },
  fileFilter: (req, file, cb) => {
    // Fix UTF-8 encoding for Thai filenames
    if (file.originalname) {
      try {
        // Try to detect and fix encoding
        const buf = Buffer.from(file.originalname, 'latin1');
        file.originalname = iconv.decode(buf, 'utf8');
      } catch (e) {
        // If conversion fails, keep original
      }
    }
    cb(null, true);
  }
});

// Helper function to check file access
function hasFileAccess(file, userId, userRole) {
  // Admin can see all files
  if (userRole === 'admin') return true;
  
  // Uploader can see own files
  if (file.uploadedBy === userId) return true;
  
  // Check if user has explicit access to this file
  const access = db.prepare('SELECT * FROM file_access WHERE fileId = ? AND userId = ?').get(file.id, userId);
  return !!access;
}

// Get all files (filtered by access)
router.get('/', auth, (req, res) => {
  try {
    const files = db.prepare(`
      SELECT f.*, u.username 
      FROM files f 
      JOIN users u ON f.uploadedBy = u.id 
      ORDER BY f.uploadedAt DESC
    `).all();

    // Filter files based on user access
    const accessibleFiles = files.filter(file => hasFileAccess(file, req.userId, req.userRole));

    // Add grantedUsers list for each file
    const enrichedFiles = accessibleFiles.map(file => {
      const grantedUsers = db.prepare(`
        SELECT u.username FROM file_access fa
        JOIN users u ON fa.userId = u.id
        WHERE fa.fileId = ?
        ORDER BY u.username
      `).all(file.id);
      
      const grantedUsernames = grantedUsers.map(u => u.username);
      
      return { 
        ...file, 
        grantedUsernames, 
        uploadedById: file.uploadedBy 
      };
    });

    res.json(enrichedFiles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files', error: error.message });
  }
});

// Upload file
router.post('/upload', auth, checkRole(['uploader', 'admin']), (req, res) => {
  // Use upload middleware and handle events
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Upload error: ' + err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { description } = req.body;
      
      const result = db.prepare(`
        INSERT INTO files (filename, originalname, uploadedBy, filesize, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(req.file.filename, req.file.originalname, req.userId, req.file.size, description || '');

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: result.lastInsertRowid,
          filename: req.file.filename,
          originalname: req.file.originalname,
          filesize: req.file.size
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  });
});

// Download file (check access first)
router.get('/:fileId/download', auth, checkRole(['downloader', 'uploader', 'admin']), (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);

    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check access
    if (!hasFileAccess(file, req.userId, req.userRole)) {
      return res.status(403).json({ message: 'You do not have access to this file' });
    }

    // บันทึก download log
    db.prepare('INSERT INTO file_downloads (fileId, userId) VALUES (?, ?)').run(fileId, req.userId);

    const filePath = path.join(uploadsDir, file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Send file as attachment
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Length', file.filesize);
    
    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ message: 'Download error' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Download failed', error: error.message });
  }
});

// Delete file (only for admin and uploader who uploaded it)
router.delete('/:fileId', auth, (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);

    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // ตรวจสอบสิทธิ์
    if (req.userRole !== 'admin' && file.uploadedBy !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own files' });
    }

    // ลบไฟล์จาก disk (ถ้ามี)
    try {
      if (file.filename) {
        const filePath = path.join(uploadsDir, String(file.filename));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✓ Deleted file from disk: ${filePath}`);
        } else {
          console.warn(`⚠ File not found on disk: ${filePath}`);
        }
      }
    } catch (fsError) {
      console.error(`✗ Error deleting file from disk: ${fsError.message}`);
      // Continue anyway - delete from database
    }

    // ลบจาก database
    db.prepare('DELETE FROM files WHERE id = ?').run(fileId);
    db.prepare('DELETE FROM file_downloads WHERE fileId = ?').run(fileId);
    db.prepare('DELETE FROM file_access WHERE fileId = ?').run(fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

// Grant file access to user (admin only)
router.post('/:fileId/access', auth, checkRole(['admin']), (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const { userId } = req.body;

    if (!fileId || !userId) {
      return res.status(400).json({ message: 'fileId and userId are required' });
    }

    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if access already exists
    const existing = db.prepare('SELECT * FROM file_access WHERE fileId = ? AND userId = ?').get(fileId, userId);
    if (existing) {
      return res.status(400).json({ message: 'User already has access to this file' });
    }

    db.prepare('INSERT INTO file_access (fileId, userId, grantedAt) VALUES (?, ?, ?)').run(fileId, userId, new Date().toISOString());

    res.json({ message: 'File access granted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to grant access', error: error.message });
  }
});

// Revoke file access from user (admin only)
router.delete('/:fileId/access/:userId', auth, checkRole(['admin']), (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const userId = parseInt(req.params.userId);

    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    db.prepare('DELETE FROM file_access WHERE fileId = ? AND userId = ?').run(fileId, userId);

    res.json({ message: 'File access revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to revoke access', error: error.message });
  }
});

// Get users with access to a file (admin only)
router.get('/:fileId/access', auth, checkRole(['admin']), (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);

    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const accessList = db.prepare(`
      SELECT u.id, u.username, u.email, fa.grantedAt
      FROM file_access fa
      JOIN users u ON fa.userId = u.id
      WHERE fa.fileId = ?
      ORDER BY fa.grantedAt DESC
    `).all(fileId);

    res.json({ fileId, filename: file.originalname, accessList });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch access list', error: error.message });
  }
});

export default router;
