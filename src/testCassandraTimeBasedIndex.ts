
const cassandra = require('cassandra-driver');

const TimeUuid = require('cassandra-driver').types.TimeUuid;
const id1 = TimeUuid.now();
const id2 = TimeUuid.fromDate(new Date());

const { config } = require('./../config.json');
const cassandraclient = new cassandra.Client({
    contactPoints: config.cassandra.contactPoints,
    localDataCenter: config.cassandra.localDataCenter,
    authProvider: new cassandra.auth
     .PlainTextAuthProvider(config.cassandra.plainTextUsername, config.cassandra.plainTextPassword)
  });

var query = "SELECT * from adoravotes.votes WHERE time >= ? ALLOW FILTERING";
var params = [id1]


export async function testtimequery() {
    console.time("stream")

    var numberOfDoneQueries = 0

    cassandraclient.stream(query, params, { prepare: true })
  .on('readable', function () {
    // readable is emitted as soon a row is received and parsed
    let row;
    while (row = this.read()) {
      // process row
      numberOfDoneQueries += 1;
    }
  })
  .on('end', function () {
    // emitted when all rows have been retrieved and read
    console.timeEnd("stream");
  console.log(`${numberOfDoneQueries} rows streamed`)
  });
}

//testtimequery()