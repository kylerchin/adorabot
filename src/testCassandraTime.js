
const cassandra = require('cassandra-driver');

const TimeUuid = require('cassandra-driver').types.TimeUuid;
const id1 = TimeUuid.now();


const { config } = require('./../config.json');
const cassandraclient = new cassandra.Client({
    contactPoints: config.cassandra.contactPoints,
    localDataCenter: config.cassandra.localDataCenter,
    authProvider: new cassandra.auth
     .PlainTextAuthProvider(config.cassandra.plainTextUsername, config.cassandra.plainTextPassword)
  });

  var today = new Date()
var priorDate = new Date().setDate(today.getDate()-30)
const id2 = TimeUuid.fromDate(new Date(priorDate));
var query = "SELECT * from adoravotes.votes WHERE time >= ? ALLOW FILTERING";
var params = [id2]


async function testtimequery() {
    console.time("stream")

    var numberOfDoneQueries = 0

    cassandraclient.stream(query, params, { prepare: true })
  .on('readable', function () {
    // readable is emitted as soon a row is received and parsed
    let row;
    while (row = this.read()) {
      // process row
      numberOfDoneQueries += 1;
      console.log(row)
    }
  })
  .on('end', function () {
    // emitted when all rows have been retrieved and read
    console.timeEnd("stream");
  console.log(`${numberOfDoneQueries} rows streamed`)
  });
}

testtimequery()