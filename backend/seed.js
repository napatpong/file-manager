import db from './database/init.js';
import bcrypt from 'bcryptjs';

console.log('Seeding database...');

try {
  // ลบ admin user ถ้ามีอยู่
  db.prepare('DELETE FROM users WHERE username = ?').run('admin');
  db.prepare('DELETE FROM user_permissions WHERE userId NOT IN (SELECT id FROM users)').run();

  // สร้าง admin user
  const hashedPassword = bcrypt.hashSync('*#482Admin#', 10);
  const result = db.prepare(`
    INSERT INTO users (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run('admin', 'it-admin@itc-group.co.th', hashedPassword, 'admin');

  // สร้าง permissions สำหรับ admin
  db.prepare(`
    INSERT INTO user_permissions (userId, canUpload, canDownload, canManage)
    VALUES (?, ?, ?, ?)
  `).run(result.lastInsertRowid, 1, 1, 1);

  console.log('✓ Database seeded successfully!');
  console.log('✓ Admin user created:');
  console.log('  Username: admin');
  console.log('  Password: *#482Admin#');
  console.log('  Email: it-admin@itc-group.co.th');
} catch (error) {
  console.error('✗ Seeding failed:', error.message);
}

process.exit(0);
