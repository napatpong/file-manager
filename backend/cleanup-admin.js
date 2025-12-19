import db from './database/init.js';

console.log('Cleaning up duplicate admin users...');

try {
  // ลบ admin ทั้งหมด
  const result = db.prepare('DELETE FROM users WHERE username = ?').run('admin');
  console.log(`✓ Deleted ${result.changes} duplicate admin users`);

  // ลบ permissions ที่เหลือ (orphaned)
  db.prepare('DELETE FROM user_permissions WHERE userId NOT IN (SELECT id FROM users)').run();
  console.log('✓ Cleaned up orphaned permissions');

} catch (error) {
  console.error('✗ Cleanup failed:', error.message);
}

process.exit(0);
