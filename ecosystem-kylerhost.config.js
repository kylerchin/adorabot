//i want new relic to be enabled for this app
module.exports = {
    apps : [{
      name: "adora",
      script: "./dist/app.js",
      interpreter_args: "-r ./newrelic.js"
    },
    {
        name: "ban",
        script: "./dist/banRuntime.js",
        interpreter_args: "-r ./newrelic.js"
      },
    {
       name: 'stats',
       script: './dist/runstatsdaemon.js',
       interpreter_args: "-r ./newrelic.js"
    },
    {
      name: 'vote',
      script: './dist/runserver.js',
      interpreter_args: "-r ./newrelic.js"
    }
  ]

  }