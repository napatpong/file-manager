# 📖 คู่มือการใช้งาน File Manager Application

## 🎯 ขั้นตอนการเริ่มต้น

### Step 1: เปิด 2 Terminal
ให้เปิด 2 Terminal windows เพื่อรัน Backend และ Frontend พร้อมกัน

### Step 2: รัน Backend Server

**Terminal 1:**
```bash
cd backend
npm install
npm run seed
npm start
```

✓ ที่ terminal จะแสดงข้อความ: `Server is running on port 5000`

### Step 3: รัน Frontend Server

**Terminal 2:**
```bash
cd frontend
npm install
npm run dev
```

✓ จะเปิด http://localhost:3000 อัตโนมัติในเบราว์เซอร์

---

## 👤 User Roles & Permissions

### 1. 👨‍💼 Admin
- ✅ อัพโหลดไฟล์
- ✅ ดาวน์โหลดไฟล์
- ✅ ลบไฟล์ของตนเองหรือไฟล์อื่น ๆ
- ✅ จัดการ users (ดู, แก้ไข, ลบ)
- ✅ เปลี่ยน role และสิทธิ์ของ users

### 2. 📤 Uploader
- ✅ อัพโหลดไฟล์
- ✅ ดาวน์โหลดไฟล์
- ✅ ลบไฟล์ของตนเอง
- ❌ จัดการ users

### 3. 📥 Downloader
- ✅ ดาวน์โหลดไฟล์
- ❌ อัพโหลดไฟล์
- ❌ จัดการ users

---

## 🚀 วิธีใช้งาน

### 1️⃣ สมัครสมาชิก (Register)

```
URL: http://localhost:3000/register

1. กรอก Username (ชื่อผู้ใช้)
2. กรอก Email (อีเมล)
3. กรอก Password (รหัสผ่าน)
4. กรอก Confirm Password (ยืนยันรหัสผ่าน)
5. คลิก Register

✓ ระบบจะสมัครสมาชิกสำหรับคุณ (role: downloader)
```

### 2️⃣ เข้าสู่ระบบ (Login)

```
URL: http://localhost:3000/login

Admin Account:
- Username: admin
- Password: admin123

หรือใช้ account ที่สมัครไปแล้ว
```

### 3️⃣ Dashboard - ดูไฟล์ทั้งหมด

```
✅ ดูไฟล์ทั้งหมดในระบบ
✅ ดาวน์โหลดไฟล์
✅ ลบไฟล์ของตนเองหรือ (admin)
✅ ดูขนาดไฟล์
✅ ดูผู้อัพโหลด
```

### 4️⃣ Upload - อัพโหลดไฟล์ (Uploader/Admin only)

```
1. คลิก "Upload" ในเมนูบน
2. เลือกไฟล์ (หรือลากวางไฟล์)
3. กรอก Description (ถ้าต้องการ)
4. คลิก "Upload File"

✓ ไฟล์จะถูกเก็บไว้ในระบบ
```

### 5️⃣ Users - จัดการผู้ใช้ (Admin only)

```
1. คลิก "Users" ในเมนูบน
2. ดูรายชื่อ users ทั้งหมด

สำหรับแต่ละ user:
- 📝 Edit: แก้ไข username, email, role, permissions
- 🗑️ Delete: ลบ user
```

---

## 🎨 UI Features

### ✨ Beautiful Design
- Gradient backgrounds (ไล่สีสวยงาม)
- Responsive layout (ใช้ได้ทั้ง desktop, tablet, mobile)
- Smooth animations (เอฟเฟกต์การเคลื่อนไหวลื่นไหล)
- Color-coded badges (บ้านสีแสดง role)

### 🎯 Good UX
- Icons สำหรับแต่ละ action
- Loading states (แสดงผ่านระหว่าง loading)
- Error messages (ข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาด)
- Success notifications (แจ้งเตือนเมื่อสำเร็จ)

---

## 🔐 Security Features

✅ **JWT Authentication** - Token-based authentication
✅ **Password Hashing** - ใช้ bcryptjs เข้ารหัส password
✅ **Role-based Access Control** - ตรวจสอบสิทธิ์ก่อนแสดง features
✅ **Database Validation** - ตรวจสอบข้อมูลก่อนบันทึก
✅ **CORS Enabled** - ป้องกัน cross-origin attacks

---

## 📊 ตัวอย่างการใช้งาน

### Scenario 1: Admin จัดการระบบ
```
1. Admin login ด้วย admin/admin123
2. ไปที่ Users page
3. สร้าง new user เป็น "uploader"
4. ไปที่ Dashboard
5. Download ไฟล์ที่ uploader อัพโหลด
```

### Scenario 2: Uploader อัพโหลดไฟล์
```
1. Uploader register หรือ login
2. ไปที่ Upload page
3. เลือกไฟล์และกรอก description
4. คลิก Upload File
5. ไฟล์ปรากฏใน Dashboard
6. Users อื่น ๆ สามารถ download
```

### Scenario 3: Downloader ดาวน์โหลดไฟล์
```
1. Downloader login
2. ไปที่ Dashboard
3. ดูไฟล์ทั้งหมด
4. คลิก Download เพื่อดาวน์โหลด
5. ไฟล์ถูกดาวน์โหลดไป
```

---

## 🛠️ Troubleshooting

### Backend ไม่ start
```
❌ Error: Cannot find module 'express'
✅ วิธีแก้: npm install ในโฟลเดอร์ backend
```

### Frontend ไม่ connect ไป Backend
```
❌ Error: Failed to fetch files
✅ วิธีแก้: 
- ตรวจสอบว่า backend รันอยู่ port 5000
- ตรวจสอบ CORS ใน server.js
```

### ไม่เห็น Upload button
```
❌ ไม่เห็น Upload ใน navbar
✅ สาเหตุ: role ของคุณคือ "downloader"
✅ วิธีแก้: ให้ admin เปลี่ยน role เป็น "uploader"
```

---

## 📁 ไฟล์ที่สำคัญ

### Backend
```
backend/
├── server.js          ← Main server file
├── database/init.js   ← Database setup
├── routes/
│   ├── auth.js        ← Login/Register
│   ├── files.js       ← File upload/download
│   └── users.js       ← User management
└── package.json       ← Dependencies
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx      ← Login page
│   │   ├── Register.jsx   ← Register page
│   │   └── Navbar.jsx     ← Navigation bar
│   ├── pages/
│   │   ├── Dashboard.jsx  ← File library
│   │   ├── Upload.jsx     ← Upload page
│   │   └── Users.jsx      ← User management
│   └── App.jsx            ← Main app
└── package.json           ← Dependencies
```

---

## 💾 Database Info

- **Type:** SQLite (better-sqlite3)
- **Location:** `backend/database/filemanager.db`
- **Tables:** users, files, file_downloads, user_permissions

---

## 🎉 All Done!

✅ Backend running on http://localhost:5000
✅ Frontend running on http://localhost:3000
✅ Admin account ready: admin/admin123
✅ Ready to use!

Happy file managing! 📁✨
