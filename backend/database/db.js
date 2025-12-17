import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'filemanager.db');

// In-memory storage fallback (for development without native modules)
const storage = {
  users: [],
  files: [],
  file_downloads: [],
  user_permissions: [],
  nextIds: { users: 1, files: 1, file_downloads: 1, user_permissions: 1 }
};

// Create a simple database wrapper
const db = {
  prepare: (sql) => ({
    run: (...params) => {
      if (sql.includes('INSERT INTO users')) {
        const id = storage.nextIds.users++;
        const user = {
          id,
          username: params[0],
          email: params[1],
          password: params[2],
          role: params[3] || 'downloader',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        storage.users.push(user);
        return { lastInsertRowid: id };
      }
      if (sql.includes('INSERT INTO user_permissions')) {
        const id = storage.nextIds.user_permissions++;
        storage.user_permissions.push({
          id,
          userId: params[0],
          canUpload: params[1],
          canDownload: params[2],
          canManage: params[3],
          createdAt: new Date().toISOString()
        });
        return { lastInsertRowid: id };
      }
      if (sql.includes('INSERT INTO files')) {
        const id = storage.nextIds.files++;
        storage.files.push({
          id,
          filename: params[0],
          originalname: params[1],
          uploadedBy: params[2],
          uploadedAt: new Date().toISOString(),
          filesize: params[3],
          description: params[4] || ''
        });
        return { lastInsertRowid: id };
      }
      if (sql.includes('INSERT INTO file_downloads')) {
        const id = storage.nextIds.file_downloads++;
        storage.file_downloads.push({
          id,
          fileId: params[0],
          userId: params[1],
          downloadedAt: new Date().toISOString()
        });
        return { lastInsertRowid: id };
      }
      if (sql.includes('UPDATE users')) {
        const user = storage.users.find(u => u.id === params[params.length - 1]);
        if (user) {
          user.username = params[0] || user.username;
          user.email = params[1] || user.email;
          user.role = params[2] || user.role;
          user.updated_at = new Date().toISOString();
        }
        return { changes: 1 };
      }
      if (sql.includes('UPDATE user_permissions')) {
        const perm = storage.user_permissions.find(p => p.userId === params[params.length - 1]);
        if (perm) {
          perm.canUpload = params[0];
          perm.canDownload = params[1];
        }
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM users')) {
        const idx = storage.users.findIndex(u => u.id === params[0]);
        if (idx !== -1) storage.users.splice(idx, 1);
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM files')) {
        const idx = storage.files.findIndex(f => f.id === params[0]);
        if (idx !== -1) storage.files.splice(idx, 1);
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM file_downloads')) {
        const idx = storage.file_downloads.findIndex(f => f.fileId === params[0]);
        if (idx !== -1) storage.file_downloads.splice(idx, 1);
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM user_permissions')) {
        const idx = storage.user_permissions.findIndex(p => p.userId === params[0]);
        if (idx !== -1) storage.user_permissions.splice(idx, 1);
        return { changes: 1 };
      }
      return { changes: 0 };
    },
    get: (...params) => {
      if (sql.includes('FROM users WHERE username = ? OR email = ?')) {
        return storage.users.find(u => u.username === params[0] || u.email === params[1]);
      }
      if (sql.includes('FROM users WHERE username =')) {
        return storage.users.find(u => u.username === params[0]);
      }
      if (sql.includes('FROM users WHERE id = ?')) {
        return storage.users.find(u => u.id === parseInt(params[0]));
      }
      if (sql.includes('FROM files WHERE id = ?')) {
        return storage.files.find(f => f.id === parseInt(params[0]));
      }
      return null;
    },
    all: (...params) => {
      if (sql.includes('FROM users u') || sql.includes('LEFT JOIN')) {
        return storage.users.map(u => ({
          ...u,
          canUpload: storage.user_permissions.find(p => p.userId === u.id)?.canUpload || 0,
          canDownload: storage.user_permissions.find(p => p.userId === u.id)?.canDownload || 1
        }));
      }
      if (sql.includes('FROM files f')) {
        return storage.files.map(f => ({
          ...f,
          username: storage.users.find(u => u.id === f.uploadedBy)?.username || 'Unknown'
        }));
      }
      if (sql.includes('FROM files')) {
        return storage.files;
      }
      return [];
    }
  }),
  exec: () => {
    console.log('Database initialized with in-memory storage');
  }
};

export default db;
export { storage };
