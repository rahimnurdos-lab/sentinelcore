module.exports = {
  apps: [
    {
      name: 'sentinel-telegram-bot',
      script: 'npm',
      args: 'run bot:start',
      watch: false,
      autorestart: true,
      max_restarts: 20,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
