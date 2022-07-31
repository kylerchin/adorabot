module.exports = {
    apps : [{
      name: "adora",
      script: "./dist/app.js"
    },
    {
        name: "ban",
        script: "./dist/banRuntime.js"
      },
    {
       name: 'stats',
       script: './dist/runstatsdaemon.js'
    }]
  }