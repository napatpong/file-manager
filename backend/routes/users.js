import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/init.js';
import auth from '../middleware/auth.js';
import checkRole from '../middleware/checkRole.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, checkRole(['admin']), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.*, up.canUpload, up.canDownload, up.canManage
      FROM users u 
      LEFT JOIN user_permissions up ON u.id = up.userId
      ORDER BY u.created_at DESC
    `).all();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Create new user (admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user exists
    let existingUser;
    if (email) {
      existingUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
    } else {
      existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    }
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run(
      username,
      email || null,
      hashedPassword,
      role || 'downloader'
    );

    const userId = result.lastInsertRowid;

    // Set default permissions
    db.prepare('INSERT INTO user_permissions (userId, canUpload, canDownload, canManage) VALUES (?, ?, ?, ?)').run(
      userId,
      role === 'uploader' || role === 'admin' ? 1 : 0,
      role === 'downloader' || role === 'uploader' || role === 'admin' ? 1 : 0,
      role === 'admin' ? 1 : 0
    );

    res.status(201).json({
      message: 'User created successfully',
      userId: userId
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});
router.get('/:userId', auth, checkRole(['admin']), (req, res) => {
  try {
    const { userId } = req.params;

    const user = db.prepare(`
      SELECT u.*, up.canUpload, up.canDownload, up.canManage
      FROM users u 
      LEFT JOIN user_permissions up ON u.id = up.userId
      WHERE u.id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// Update user (admin only)
router.put('/:userId', auth, checkRole(['admin']), (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role, canUpload, canDownload } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    db.prepare('UPDATE users SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      username || user.username,
      email || user.email,
      role || user.role,
      userId
    );

    // Update permissions
    db.prepare('UPDATE user_permissions SET canUpload = ?, canDownload = ? WHERE userId = ?').run(
      canUpload !== undefined ? canUpload : user.canUpload,
      canDownload !== undefined ? canDownload : user.canDownload,
      userId
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:userId', auth, checkRole(['admin']), (req, res) => {
  try {
    const { userId } = req.params;

    // ไม่ให้ลบ admin ตัวเอง
    if (req.userId === parseInt(userId)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ลบ files ที่ user นี้ uploaded
    const userFiles = db.prepare('SELECT filename, id FROM files WHERE uploadedBy = ?').all(userId);
    
    for (const file of userFiles) {
      db.prepare('DELETE FROM file_access WHERE fileId = ?').run(file.id);
      db.prepare('DELETE FROM file_downloads WHERE fileId = ?').run(file.id);
      db.prepare('DELETE FROM files WHERE id = ?').run(file.id);
    }

    // ลบ permissions, downloads และ user
    db.prepare('DELETE FROM user_permissions WHERE userId = ?').run(userId);
    db.prepare('DELETE FROM file_downloads WHERE userId = ?').run(userId);
    db.prepare('DELETE FROM file_access WHERE userId = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

export default router;
