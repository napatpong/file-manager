# ⚡ Quick Start - File Manager App

## Development Mode (Default)

### 1️⃣ Open Terminal and navigate to Backend

```bash
cd backend
npm start
```

**Wait for:**
```
Server is running on port 5000
Database initialized at ./database/filemanager.db
```

---

### 2️⃣ Open New Terminal and navigate to Frontend

```bash
cd frontend
npm run dev
```

**You'll see:**
```
➜  Local:   http://localhost:3000/
```

Browser will automatically open http://localhost:3000

---

### 3️⃣ Login with Admin Account

```
Username: admin
Password: admin123
```

---

## Production Mode

### 1️⃣ Backend on Port 2087

```bash
cd backend
NODE_ENV=production npm start
```

### 2️⃣ Frontend on Port 443

```bash
cd frontend
NODE_ENV=production npm run dev
```

**Access**: https://localhost:443

---

## Environment Configuration

### Backend
- **Development** (`.env`): `PORT=5000`
- **Production** (`.env.production`): `PORT=2087`

### Frontend
- **Development** (`.env.development`): `VITE_API_URL=http://localhost:5000`
- **Production** (`.env.production`): `VITE_API_URL=http://localhost:2087`

### 📤 Upload
- อัพโหลดไฟล์ใหม่
- เพิ่ม description

### 👥 Users
- ดูรายชื่อ users
- เปลี่ยน role
- ลบ users

---

## ✅ สิ่งที่จะเกิดขึ้น

✨ **Login page** - สวยงามพร้อม gradient background
✨ **Dashboard** - ไฟล์ทั้งหมดแสดงในการ์ด
✨ **Upload** - ลากวางไฟล์ได้
✨ **Users** - ตารางจัดการผู้ใช้

---

## 🆘 ถ้าเกิดปัญหา

**Backend ไม่ start:**
```bash
cd backend
npm install --save
node server.js
```

**Frontend ไม่เปิด:**
```bash
cd frontend
npm install --save
npm run dev
```

---

## 📚 ข้อมูลเพิ่มเติม

- **README.md** - รายละเอียดครบถ้วน
- **GUIDE_TH.md** - คู่มือภาษาไทย

---

## 🎉 Done!

ตอนนี้คุณพร้อมใช้ File Manager แล้ว! 🚀
