
const cassandra = require('cassandra-driver');


const { config } = require('./../config.json');
const cassandraclient = new cassandra.Client({
    contactPoints: config.cassandra.contactPoints,
    localDataCenter: config.cassandra.localDataCenter,
    authProvider: new cassandra.auth
     .PlainTextAuthProvider(config.cassandra.plainTextUsername, config.cassandra.plainTextPassword)
  });

var query = "SELECT * from adoramoderation.banneduserlist";
var params = []

async function automatic() {
    console.time("first");

    var numberOfDoneQueries = 0

const result = await cassandraclient.execute(query, params, { prepare: true });

for await (const row of result) {
    numberOfDoneQueries += 1;
  }

  console.timeEnd("first");
  console.log(`${numberOfDoneQueries} rows automatic`)
}

async function stream() {
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

automatic()
stream()