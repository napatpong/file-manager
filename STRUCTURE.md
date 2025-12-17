# Project Structure Overview

```
file-manager-app/
│
├── 📄 README.md                 # Project documentation (English)
├── 📄 GUIDE_TH.md              # User guide (Thai)
├── 📄 QUICK_START.md           # Quick start guide
├── .gitignore                   # Git ignore file
│
├── .github/
│   └── copilot-instructions.md
│
├── backend/                     # Node.js/Express Server
│   ├── 📄 server.js            # Main server file
│   ├── 📄 seed.js              # Database seeding script
│   ├── 📄 package.json         # Dependencies
│   ├── 📄 .env                 # Environment variables
│   ├── 📄 .env.example         # Environment template
│   ├── 📄 .gitignore           # Backend gitignore
│   │
│   ├── database/
│   │   ├── 📄 init.js          # Database initialization
│   │   └── filemanager.db      # SQLite database (auto-created)
│   │
│   ├── middleware/
│   │   ├── 📄 auth.js          # JWT authentication middleware
│   │   └── 📄 checkRole.js     # Role checking middleware
│   │
│   ├── routes/
│   │   ├── 📄 auth.js          # Auth endpoints (register, login)
│   │   ├── 📄 files.js         # File endpoints (upload, download, delete)
│   │   └── 📄 users.js         # User management endpoints
│   │
│   └── uploads/                 # File storage directory
│       └── .gitkeep
│
└── frontend/                    # React Application
    ├── 📄 package.json         # Dependencies
    ├── 📄 vite.config.js       # Vite configuration
    ├── 📄 tailwind.config.js   # Tailwind CSS config
    ├── 📄 postcss.config.js    # PostCSS config
    ├── 📄 tsconfig.json        # TypeScript config
    ├── 📄 tsconfig.node.json   # TS config for build tools
    ├── 📄 .gitignore           # Frontend gitignore
    │
    ├── public/
    │   └── 📄 index.html       # HTML entry point
    │
    └── src/
        ├── 📄 App.jsx          # Main app component
        ├── 📄 App.css          # App styles
        ├── 📄 index.jsx        # React entry point
        ├── 📄 index.css        # Global styles
        │
        ├── context/
        │   └── 📄 AuthContext.jsx    # Auth context & hooks
        │
        ├── components/
        │   ├── 📄 Navbar.jsx        # Navigation bar
        │   ├── 📄 Login.jsx         # Login component
        │   └── 📄 Register.jsx      # Register component
        │
        └── pages/
            ├── 📄 Dashboard.jsx      # Files library page
            ├── 📄 Upload.jsx        # File upload page
            └── 📄 Users.jsx         # User management page
```

## Key Files Explanation

### Backend Files

**server.js** - Express app setup, routes, middleware
**database/init.js** - SQLite schema and initialization
**routes/auth.js** - POST /register, POST /login
**routes/files.js** - GET/POST/DELETE files endpoints
**routes/users.js** - User management endpoints (admin only)
**middleware/auth.js** - JWT token verification
**middleware/checkRole.js** - Role-based access control
**seed.js** - Create admin user for testing

### Frontend Files

**App.jsx** - Main app routing and layout
**context/AuthContext.jsx** - Authentication state management
**components/Navbar.jsx** - Top navigation with user info
**pages/Dashboard.jsx** - File library and download
**pages/Upload.jsx** - File upload form
**pages/Users.jsx** - User management table

## Technologies

- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** React 18, Vite, React Router
- **Styling:** Tailwind CSS
- **Authentication:** JWT
- **Password:** bcryptjs
- **File Upload:** Multer
- **HTTP Client:** Axios
