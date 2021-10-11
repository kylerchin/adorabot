const { config } = require('./../config.json');
//import _ = require('lodash');
import * as _ from 'lodash'
import { logger, tracer, span } from './modules/logger'
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const cassandra = require('cassandra-driver');
var axios = require('axios');

var forEach = require("for-each")

const cassandraclient = new cassandra.Client({
  contactPoints: config.cassandra.contactPoints,
  localDataCenter: config.cassandra.localDataCenter,
  authProvider: new cassandra.auth
    .PlainTextAuthProvider(config.cassandra.plainTextUsername, config.cassandra.plainTextPassword)
});

export function initDatabases() {
  //This Function will automatically create the adoramoderation keyspace if it doesn't exist, otherwise, carry on
  cassandraclient.execute("CREATE KEYSPACE IF NOT EXISTS adorasafebrowsing WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy',  'datacenter1': 1  };")
    .then(async result => {
      await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
      /*console.log(result)*/

      await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adorasafebrowsing.threatprefixes (prefix text PRIMARY KEY, threat text, platform text, time timeuuid);")
        .then(async result => {
          await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
          /*console.log(result)*/
        }).catch(error => console.error(error));

      await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adorasafebrowsing.liststate (list text PRIMARY KEY, state text);")
        .then(async result => {
          await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
          /*console.log(result)*/
        }).catch(error => console.error(error));

        return true;

    }).catch(error => console.error(error));


}

async function addToDatabase(threatType, platformType) {

  var listStateToAskGoogle = ''

  var queryStateOfList = "SELECT * FROM adorasafebrowsing.liststate WHERE list = ?"
  var paramsStateOfList = [`${threatType}-${platformType}`]

  await cassandraclient.execute(queryStateOfList,paramsStateOfList, { prepare: true })
  .then(resultOfListState => {
    if (resultOfListState.rows.length === 0) {
      //the state isnt in the database
      listStateToAskGoogle = ''
  } else {
      //set the list state
      listStateToAskGoogle = resultOfListState.rows[0].state;

  }

  logger.discordInfoLogger.info({type: "lookupliststatesuccess", message: `state for ${threatType}-${platformType}`})
  // logger.discordSillyLogger.silly({type: "threatprefixadd", message: result})
}).catch((error) => {
 logger.discordErrorLogger.error({type: "lookupliststateerror", message: error})
});

var data = JSON.stringify({
  "client": {
    "clientId": "adora",
    "clientVersion": "1.0.0"
  },
  "listUpdateRequests": [
    {
      "threatType": threatType,
      "platformType": platformType,
      "threatEntryType": "URL",
      "state": listStateToAskGoogle,
      "constraints": {
        "maxUpdateEntries": 1024,
        "maxDatabaseEntries": 0,
        "region": "US",
        "supportedCompressions": [
          "RAW"
        ]
      }
    }
  ]
});

var config = {
  method: 'post',
  url: 'https://safebrowsing.googleapis.com/v4/threatListUpdates:fetch?key=AIzaSyCWAYXQ1X0Wu5uFxWDJ7GJGeF4cm5TZ8d0',
  headers: {
    'Content-Type': 'application/json'
  },
  data: data
};

await axios(config)
  .then(async function (response) {
    console.log("responserecieved for " + threatType)
    //console.log(JSON.stringify(response.data));
    //logger.discordInfoLogger.info(response)
    const data = response.data;

    forEach(data.listUpdateResponses,async function (eachUpdateResponse) {
      await forEach(eachUpdateResponse.additions,async function (eachAddition) {
        // eachAddition.rawHashes.rawHashes

        var prefixSize = eachAddition.rawHashes.prefixSize

        //var additionsArray = _.chunk(eachAddition.rawHashes.rawHashes, prefixSize);
       var additionsArray = eachAddition.rawHashes.rawHashes.match(new RegExp('.{1,' + prefixSize + '}', 'g'));

       // console.log(additionsArray)
        if (true) {
          forEach(additionsArray,async function (eachPrefixToAdd) {

            //console.log(eachPrefixToAdd)
            //upload [eachPrefixToAdd, "threat type", "platform type", "time of addition"]
  
            // Use query markers (?) and parameters
  
            var queryForPrefix = "INSERT INTO adorasafebrowsing.threatprefixes (prefix, threat, platform, time) VALUES (?, ?, ?, ?);"
            var paramsForPrefix = [eachPrefixToAdd, eachUpdateResponse.threatType, eachUpdateResponse.platformType, TimeUuid.now()]
            // const query = 'UPDATE users SET birth = ? WHERE key=?'; 
            //  const params = [ new Date(1942, 10, 1), 'jimi-hendrix' ];
  
            // Set the prepare flag in the query options
            /*
             await cassandraclient.execute(queryForPrefix, paramsForPrefix, { prepare: true })
             .then(result => {
             // logger.discordSillyLogger.silly({type: "threatprefixadd", message: result})
          }).catch((error) => {
            logger.discordErrorLogger.error({type: "threatprefixadderror", message: error})
          });
          */
            // console.log('Row updated on the cluster');
          })
        }

        if (false) {
          var queriesToSendToCassandraQueue = additionsArray.map((eachPrefixToAdd) => {
            var queryForPrefix = "INSERT INTO adorasafebrowsing.threatprefixes (prefix, threat, platform, time) VALUES (?, ?, ?, ?);"
            var paramsForPrefix = [eachPrefixToAdd, eachUpdateResponse.threatType, eachUpdateResponse.platformType, TimeUuid.now()]
            return {
              query: queryForPrefix,
              params: paramsStateOfList
            }
          })
  
                  // Promise-based call
          cassandraclient.batch(queriesToSendToCassandraQueue, { prepare: true })
          .then(function() {
            // All queries have been executed successfully
            console.log("All queries have been executed successfully")
          })
          .catch(function(err) {
            // None of the changes have been applied
            console.log("None of the changes have been applied")
          });
        }
        
       
      })

      //update states on list state database
      var queryForListState = "INSERT INTO adorasafebrowsing.liststate (list, state) VALUES (?, ?);"
      var paramsForListState = [`${eachUpdateResponse.threatType}-${eachUpdateResponse.platformType}`,eachUpdateResponse.newClientState]
      await cassandraclient.execute(queryForListState, paramsForListState, { prepare: true })
      .then(async resultForListStateSave => {
       logger.discordSillyLogger.silly({type: "liststatesave", message: resultForListStateSave})
   }).catch((error) => {
     logger.discordErrorLogger.error({type: "savestateerror", message: error})
   });
    })
  })
  .catch(function (error) {
    console.log(error);
  });

  return true;
 
}

initDatabases()
addToDatabase("SOCIAL_ENGINEERING", "ANY_PLATFORM")
addToDatabase("MALWARE", "ANY_PLATFORM")