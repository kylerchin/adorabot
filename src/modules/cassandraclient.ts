const { config } = require('./../../config.json');
const cassandra = require('cassandra-driver');

export const cassandraclient = new cassandra.Client({
  queryOptions: {
    fetchSize: 25000,
    prepare: false,
    captureStackTrace: false
  },
  pooling: {
    maxRequestsPerConnection: 32768
  },
  contactPoints: config.cassandra.contactPoints,
  localDataCenter: config.cassandra.localDataCenter,
  authProvider: new cassandra.auth
   .PlainTextAuthProvider(config.cassandra.plainTextUsername, config.cassandra.plainTextPassword)
});