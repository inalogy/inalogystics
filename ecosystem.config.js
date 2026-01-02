/**
 * PM2 Ecosystem Configuration
 *
 * This file configures PM2 process manager for the InaLogystics application
 * PM2 provides process management, monitoring, and zero-downtime reloads
 *
 * Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      name: 'inalogystics',
      script: 'npm',
      args: 'start',
      cwd: './',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },

      // Instance configuration
      instances: 1, // Set to 'max' for cluster mode (uses all CPU cores)
      exec_mode: 'fork', // 'cluster' for cluster mode

      // Restart policy
      autorestart: true,
      watch: false, // Set to true to auto-restart on file changes (dev only)
      max_memory_restart: '1G', // Restart if memory usage exceeds 1GB

      // Restart delay
      restart_delay: 4000, // Wait 4 seconds before restart

      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Advanced features
      min_uptime: '10s', // Minimum uptime before considered stable
      max_restarts: 10, // Max restarts within min_uptime before app is stopped

      // Source map support for better error traces
      source_map_support: true,

      // Kill timeout (SIGTERM -> SIGKILL)
      kill_timeout: 5000,

      // Listen timeout (wait for app to be ready)
      listen_timeout: 10000,

      // Environment-specific settings
      env_development: {
        NODE_ENV: 'development',
        PORT: 3002,
        watch: true
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ],

  /**
   * Deployment configuration (optional)
   * Allows PM2 to handle deployments via SSH
   */
  deploy: {
    production: {
      user: 'inalogystics',
      host: 'your-server.com', // Replace with your server hostname/IP
      ref: 'origin/main',
      repo: 'https://github.com/inalogy/inalogystics.git',
      path: '/home/inalogystics/apps/inalogystics',
      'post-deploy': 'npm ci && npm run db:generate && npm run db:migrate:deploy && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git',
      'post-setup': 'npm install && npm run db:generate && npm run db:migrate:deploy && npm run build'
    }
  }
}
