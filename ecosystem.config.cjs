module.exports = {
  apps: [
    {
      name: 'file-manager',
      script: './server.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 2087,
        HTTP_PORT: 2086,
        JWT_SECRET: 'your_jwt_secret_key_change_in_production',
        DATABASE_PATH: './backend/database/data.json',
        UPLOAD_DIR: './uploads'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      max_memory_restart: '500M',
      node_args: '--max-old-space-size=512',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
