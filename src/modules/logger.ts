const { createLogger, format, transports, winstonconfig } = require('winston');
const { config } = require('./../../config.json');
const { ElasticsearchTransport } = require('winston-elasticsearch');
var DatadogWinston = require('datadog-winston')

export const tracer = require('dd-trace').init({
  logInjection: true
});

const httpTransportOptions = {
  host: 'http-intake.logs.datadoghq.com',
  path: `/v1/input/${config.datadogapi}?ddsource=nodejs&service=adora`,
  ssl: true
};

const clientOpts = {
  "node": "http://localhost:9200"
}

var transportsArray = [
new transports.Console(),
new ElasticsearchTransport({level: 'debug', 'clientOpts': clientOpts}),
new DatadogWinston({
  apiKey: config.datadogapi,
  service: 'adora',
  ddsource: 'nodejs',
})]


export const logger = {
  discordDebugLogger: createLogger({
    level: 'debug',
    exitOnError: false,
    format: format.json(),
    transports: transportsArray
  }),
  discordWarnLogger: createLogger({
    level: 'warn',
    exitOnError: false,
    format: format.json(),
    transports: transportsArray
  }),
  discordInfoLogger: createLogger({
    level: 'info',
    exitOnError: false,
    format: format.json(),
    transports: transportsArray
  }),
  discordElasticLogger: createLogger({
    level: 'info',
    exitOnError: false,
    transports: transportsArray
  }),
  discordSillyLogger: createLogger({
    level: 'silly',
    exitOnError: false,
    format: format.json(),
    transports: [
      new transports.Http(httpTransportOptions)
    ]
  }),
  discordErrorLogger: createLogger({
    level: 'error',
    exitOnError: false,
    format: format.json(),
    transports: transportsArray
  })
}

logger.discordInfoLogger.on('error', function (err) { /* Do Something */ 
  console.log('logging error')
  console.log(err)
});

export const span = tracer.scope().active()