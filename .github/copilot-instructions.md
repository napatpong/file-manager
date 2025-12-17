# File Manager Application Setup

## Project Overview
Full-stack file management web application with authentication, user roles, and admin panel.

## Installation Steps

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed
npm start
```

Server runs on http://localhost:5000

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## Default Admin Credentials
- Username: admin
- Password: admin123
- Email: admin@filemanager.com

## Features
- User Authentication (JWT)
- Role-based Access Control (Admin, Uploader, Downloader)
- File Upload/Download Management
- Admin User Management Panel
- Beautiful Tailwind CSS UI
