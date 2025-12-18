import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../database/init.js';
import auth from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Use UPLOAD_DIR from environment, fallback to local ./uploads
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
const tempDir = path.join(uploadsDir, '.chunks');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const fileId = req.body.fileId;
    const chunkNumber = req.body.chunkNumber;
    cb(null, `${fileId}-chunk-${chunkNumber}`);
  }
});

const upload = multer({ storage });

// Upload a single chunk
router.post('/chunk', auth, upload.single('chunk'), (req, res) => {
  try {
    const { fileId, chunkNumber, totalChunks } = req.body;

    if (!fileId || !chunkNumber || !totalChunks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    res.json({
      success: true,
      fileId,
      chunkNumber: parseInt(chunkNumber),
      totalChunks: parseInt(totalChunks)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Finalize upload - combine chunks and create file
router.post('/finalize', auth, async (req, res) => {
  try {
    const { fileId, fileName, totalChunks, description } = req.body;
    const userId = req.user.id;

    if (!fileId || !fileName || !totalChunks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Combine chunks
    const outputFileName = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(fileName);
    const outputPath = path.join(uploadsDir, outputFileName);
    const writeStream = fs.createWriteStream(outputPath);

    for (let i = 0; i < parseInt(totalChunks); i++) {
      const chunkPath = path.join(tempDir, `${fileId}-chunk-${i}`);
      
      if (!fs.existsSync(chunkPath)) {
        return res.status(400).json({ error: `Missing chunk ${i}` });
      }

      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
      fs.unlinkSync(chunkPath); // Delete chunk after reading
    }

    writeStream.end();

    writeStream.on('finish', async () => {
      try {
        // Store file info in database
        const fileSize = fs.statSync(outputPath).size;
        
        const result = db.prepare(
          `INSERT INTO files (user_id, file_name, file_path, file_size, description)
           VALUES (?, ?, ?, ?, ?)`
        ).run(userId, fileName, outputFileName, fileSize, description || '');

        res.json({
          success: true,
          file: {
            id: result.lastInsertRowid,
            name: fileName,
            size: fileSize,
            path: outputFileName
          }
        });
      } catch (err) {
        console.error('Finalize error:', err);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        res.status(500).json({ error: err.message });
      }
    });

    writeStream.on('error', (err) => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      res.status(500).json({ error: err.message });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
