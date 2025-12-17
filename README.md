# File Manager Application

ระบบการจัดการไฟล์แบบเต็มรูปแบบพร้อม Authentication, Authorization และ Admin Panel

## ⚙️ เทคโนโลยีที่ใช้

### Backend
- **Node.js + Express** - Server API
- **SQLite** - Database (better-sqlite3)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📋 Features

### Authentication & Authorization
✅ User Registration (สมัครสมาชิก)
✅ User Login (เข้าสู่ระบบ)
✅ JWT Token-based authentication
✅ Role-based access control (Admin, Uploader, Downloader)

### File Management
✅ Upload files (สำหรับ uploader และ admin)
✅ Download files (สำหรับ downloader, uploader, admin)
✅ Delete files (เจ้าของไฟล์และ admin เท่านั้น)
✅ View file library
✅ File description

### User Management (Admin Only)
✅ View all users
✅ Edit user details
✅ Change user role
✅ Manage user permissions
✅ Delete users

### User Roles
1. **Admin** - Full access, manage users and files
2. **Uploader** - Can upload and download files
3. **Downloader** - Can only download files

## 🚀 Installation & Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

Server runs on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on http://localhost:3000

## 🧪 Testing the Application

### ทดสอบด้วย Test Credentials

ระบบจะสร้าง admin user อัตโนมัติ:
- **Username:** admin
- **Email:** admin@filemanager.com
- **Password:** admin123

### ขั้นตอนการทดสอบ

1. **Register new user** (สมัครสมาชิกใหม่)
   - Go to http://localhost:3000/register
   - Fill in username, email, password
   - Click Register

2. **Login** (เข้าสู่ระบบ)
   - Go to http://localhost:3000/login
   - Enter credentials
   - Click Login

3. **Upload File** (อัพโหลดไฟล์ - Uploader/Admin only)
   - Click "Upload" button in navbar
   - Select file
   - Add description (optional)
   - Click "Upload File"

4. **Download File** (ดาวน์โหลดไฟล์)
   - From Dashboard, click "Download" button on any file

5. **Manage Users** (จัดการผู้ใช้ - Admin only)
   - Click "Users" button in navbar
   - Edit role and permissions
   - Delete users

## 🗄️ Database Schema

### users table
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password (hashed)
- role (admin, uploader, downloader)
- created_at
- updated_at

### files table
- id (PRIMARY KEY)
- filename
- originalname
- uploadedBy (FOREIGN KEY)
- uploadedAt
- filesize
- description

### file_downloads table
- id (PRIMARY KEY)
- fileId (FOREIGN KEY)
- userId (FOREIGN KEY)
- downloadedAt

### user_permissions table
- id (PRIMARY KEY)
- userId (FOREIGN KEY)
- canUpload
- canDownload
- canManage

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Files
- `GET /api/files` - Get all files
- `POST /api/files/upload` - Upload file (auth required)
- `GET /api/files/:fileId/download` - Download file (auth required)
- `DELETE /api/files/:fileId` - Delete file (auth required)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:userId` - Get user details (admin only)
- `PUT /api/users/:userId` - Update user (admin only)
- `DELETE /api/users/:userId` - Delete user (admin only)

## 🎨 UI Features

✨ Beautiful gradient design
✨ Responsive layout (mobile-friendly)
✨ Smooth animations and transitions
✨ Icons for better UX
✨ Color-coded role badges
✨ Loading states
✨ Error messages
✨ Success notifications

## 📁 Project Structure

```
file-manager-app/
├── backend/
│   ├── database/
│   │   └── init.js (Database initialization)
│   ├── middleware/
│   │   ├── auth.js (JWT verification)
│   │   └── checkRole.js (Role checking)
│   ├── routes/
│   │   ├── auth.js (Authentication routes)
│   │   ├── files.js (File management routes)
│   │   └── users.js (User management routes)
│   ├── uploads/ (Uploaded files directory)
│   ├── server.js (Main server file)
│   ├── package.json
│   └── .env (Environment variables)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Upload.jsx
    │   │   └── Users.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   ├── index.jsx
    │   └── index.css
    ├── public/
    │   └── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── .gitignore
```

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
DATABASE_PATH=./database/filemanager.db
NODE_ENV=development
```

## 💡 Tips

- Change JWT_SECRET in production
- Set NODE_ENV=production in production
- Upload directory is ./uploads relative to backend directory
- Database is SQLite file at ./database/filemanager.db

## 📝 License

MIT
