module.exports = {
  apps: [
    {
      name: 'file-manager-backend',
      script: './backend/server.js',
      cwd: './',
      instances: 1,        // Set to 'max' for multi-core systems
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 2087
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      max_memory_restart: '500M',
      node_args: '--max-old-space-size=512',
      // Auto-restart on crashes
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
