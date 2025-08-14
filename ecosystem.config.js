module.exports = {
  apps: [
    {
      name: 'thinqchess',
      script: './node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/html/thinqchess',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/thinqchess-error.log',
      out_file: '/var/log/thinqchess-out.log',
      log_file: '/var/log/thinqchess-combined.log',
      time: true,
      merge_logs: true
    }
  ]
};
