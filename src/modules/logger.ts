const { createLogger, format, transports, winstonconfig } = require('winston');
const { config } = require('./../../config.json');

export const tracer = require('dd-trace').init({
  logInjection: true
});

const httpTransportOptions = {
  host: 'http-intake.logs.datadoghq.com',
  path: `/v1/input/${config.datadogapi}?ddsource=nodejs&service=adora`,
  ssl: true
};

export const logger = {
  discordDebugLogger: createLogger({
    level: 'debug',
    exitOnError: false,
    format: format.json(),
    transports: [
      new transports.Http(httpTransportOptions),
      new transports.Console()
    ]
  }),
  discordWarnLogger: createLogger({
    level: 'warn',
    exitOnError: false,
    format: format.json(),
    transports: [
      new transports.Http(httpTransportOptions),
      new transports.Console()
    ]
  }),
  discordInfoLogger: createLogger({
    level: 'info',
    exitOnError: false,
    format: format.json(),
    transports: [
      new transports.Console(),
      new transports.Http(httpTransportOptions)
    ]
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
    transports: [
      new transports.Console(),
      new transports.Http(httpTransportOptions)
    ]
  })
}

export const span = tracer.scope().active()