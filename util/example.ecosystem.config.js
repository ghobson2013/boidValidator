module.exports = {
  apps : [
    {
      name: 'cron1',
      script: 'cron/runCronGroup.js',
      args: '1',
      restart_delay: 1200000,
    },
    {
      name: 'getBoincWork',
      script: 'cron/runSingleCron.js',
      args: 'getBoincWork',
      restart_delay: 300000,
    },
    {
      name: 'getRvnWork',
      script: 'cron/runSingleCron.js',
      args: 'getRvnWork',
      restart_delay:600000,
    }
  ]
}
