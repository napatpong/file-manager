import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

// Shared in-memory database storage
export let storage = {
  users: [],
  files: [],
  file_downloads: [],
  user_permissions: [],
  file_access: [],
  nextIds: { users: 1, files: 1, file_downloads: 1, user_permissions: 1, file_access: 1 }
};

// Load data from file if it exists
function loadStorage() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      storage = JSON.parse(data);
      console.log('✓ Data loaded from file');
      return true;
    }
  } catch (err) {
    console.error('Error loading storage:', err.message);
  }
  return false;
}

// Save data to file
function saveStorage() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(storage, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving storage:', err.message);
  }
}

// Load data on startup
loadStorage();

// Create a simple database wrapper
export const db = {
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
        saveStorage();
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
        saveStorage();
        return { lastInsertRowid: id };
      }
      if (sql.includes('INSERT INTO files')) {
        const id = storage.nextIds.files++;
        
        // Detect schema based on column names in SQL
        // Old schema: INSERT INTO files (filename, originalname, uploadedBy, filesize, description)
        // New schema: INSERT INTO files (user_id, file_name, file_path, file_size, description)
        
        if (sql.includes('user_id')) {
          // New schema
          const file = {
            id,
            user_id: params[0], // userId
            file_name: params[1], // fileName
            file_path: params[2], // filePath
            file_size: params[3], // fileSize
            description: params[4] || '',
            // Also keep old field names for backwards compatibility
            filename: params[2], // filePath (old name)
            originalname: params[1], // fileName (old name)
            uploadedBy: params[0], // userId (old name)
            uploadedAt: new Date().toISOString(),
            filesize: params[3] // fileSize (old name)
          };
          storage.files.push(file);
        } else {
          // Old schema: (filename, originalname, uploadedBy, filesize, description)
          const file = {
            id,
            filename: params[0], // filename on disk
            originalname: params[1], // original filename
            uploadedBy: params[2], // userId
            uploadedAt: new Date().toISOString(),
            filesize: params[3], // file size
            description: params[4] || '',
            // Also map to new field names
            file_path: params[0], // filename
            file_name: params[1], // originalname
            user_id: params[2], // uploadedBy
            file_size: params[3] // filesize
          };
          storage.files.push(file);
        }
        
        saveStorage();
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
        saveStorage();
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
        saveStorage();
        return { changes: 1 };
      }
      if (sql.includes('UPDATE user_permissions')) {
        const perm = storage.user_permissions.find(p => p.userId === params[params.length - 1]);
        if (perm) {
          perm.canUpload = params[0];
          perm.canDownload = params[1];
        }
        saveStorage();
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM users')) {
        const idx = storage.users.findIndex(u => u.id === parseInt(params[0]));
        if (idx !== -1) storage.users.splice(idx, 1);
        saveStorage();
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM files')) {
        // Support both DELETE FROM files WHERE id = ? and WHERE uploadedBy = ?
        if (sql.includes('WHERE id = ?')) {
          const idx = storage.files.findIndex(f => f.id === parseInt(params[0]));
          if (idx !== -1) storage.files.splice(idx, 1);
        } else if (sql.includes('WHERE uploadedBy = ?')) {
          // Delete all files uploaded by user
          storage.files = storage.files.filter(f => f.uploadedBy !== parseInt(params[0]));
        }
        saveStorage();
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM file_downloads')) {
        // Support DELETE FROM file_downloads WHERE fileId = ? or userId = ?
        if (sql.includes('WHERE fileId = ?')) {
          storage.file_downloads = storage.file_downloads.filter(f => f.fileId !== parseInt(params[0]));
        } else if (sql.includes('WHERE userId = ?')) {
          storage.file_downloads = storage.file_downloads.filter(f => f.userId !== parseInt(params[0]));
        }
        saveStorage();
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM user_permissions')) {
        const idx = storage.user_permissions.findIndex(p => p.userId === parseInt(params[0]));
        if (idx !== -1) storage.user_permissions.splice(idx, 1);
        saveStorage();
        return { changes: 1 };
      }
      if (sql.includes('INSERT INTO file_access')) {
        const id = storage.nextIds.file_access++;
        storage.file_access.push({
          id,
          fileId: params[0],
          userId: params[1],
          grantedAt: new Date().toISOString()
        });
        saveStorage();
        return { lastInsertRowid: id };
      }
      if (sql.includes('DELETE FROM file_access')) {
        // Support DELETE FROM file_access WHERE fileId = ? AND userId = ? or WHERE userId = ?
        if (sql.includes('WHERE fileId = ? AND userId = ?')) {
          const idx = storage.file_access.findIndex(f => f.fileId === parseInt(params[0]) && f.userId === parseInt(params[1]));
          if (idx !== -1) storage.file_access.splice(idx, 1);
        } else if (sql.includes('WHERE userId = ?')) {
          // Delete all file access for user
          storage.file_access = storage.file_access.filter(f => f.userId !== parseInt(params[0]));
        } else if (sql.includes('WHERE fileId = ?')) {
          // Delete all file access for file
          storage.file_access = storage.file_access.filter(f => f.fileId !== parseInt(params[0]));
        }
        saveStorage();
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
      if (sql.includes('FROM file_access WHERE fileId = ? AND userId = ?')) {
        return storage.file_access.find(
          fa => fa.fileId === parseInt(params[0]) && fa.userId === parseInt(params[1])
        );
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
      if (sql.includes('FROM file_access fa')) {
        // Query: SELECT u.id, u.username, u.email, fa.grantedAt FROM file_access fa JOIN users u ON fa.userId = u.id WHERE fa.fileId = ?
        const fileId = parseInt(params[0]);
        return storage.file_access
          .filter(fa => fa.fileId === fileId)
          .map(fa => {
            const user = storage.users.find(u => u.id === fa.userId);
            return {
              id: user?.id,
              username: user?.username,
              email: user?.email,
              grantedAt: fa.grantedAt
            };
          });
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
  },
  saveStorage: saveStorage
};

export { saveStorage };
export default db;
