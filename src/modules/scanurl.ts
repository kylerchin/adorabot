import {uniq} from './util'
const { canonicalize, getPrefixes } = require('webrisk-hash');
import {logger} from './logger'
var forEach = require("for-each")
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const cassandra = require('cassandra-driver');

const { config } = require('./../../config.json');

const cassandraclient = new cassandra.Client({
    contactPoints: config.cassandra.contactPoints,
    localDataCenter: config.cassandra.localDataCenter,
    authProvider: new cassandra.auth
      .PlainTextAuthProvider(config.cassandra.plainTextUsername, config.cassandra.plainTextPassword)
  });

export function processmalwarediscordmessage(message) {
    var arrayOfUrls = message.content.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm)
   // arrayOfUrls = uniq(arrayOfUrls)

   // console.log("arrayOfUrls", arrayOfUrls)
    //console.log("typeof arrayOfUrls", typeof arrayOfUrls)

    if (arrayOfUrls === null) {

    } else {
        if (arrayOfUrls.length > 0) {
            var cleanedArrayOfHashes = arrayOfUrls.map(eachUrl => {
               var prefix = getPrefixes(eachUrl)

              // console.log("prefix", prefix)

               var prefixArray:Array<any> = Array.from(prefix);

            //   console.log("prefixArray", prefixArray)

               var base64String = prefixArray.map(eachprefix => Buffer.from(eachprefix).toString('base64'))

               return base64String
            })
        
  //          console.log('cleanedArrayOfHashes', cleanedArrayOfHashes)

//            console.log("before each url for each")

            //each url has several hashes
            forEach(cleanedArrayOfHashes, function (hashesForOneUrl, index) {
                var currentUrl = arrayOfUrls[index]

             //   console.log("before each hash for each")
                
                //for each hash in 1 url at a time

                forEach(hashesForOneUrl, function (eachHash, indexOfHash) {
                    var queryHash = "SELECT * FROM adorasafebrowsing.threatprefixes WHERE prefix = ?"

                    var paramsHash = [eachHash.substring(0, 4)]

                   // console.log("paramsHash", paramsHash)
                    cassandraclient.execute(queryHash, paramsHash).then((resultOfHashCheck) => 
                    {
                        if (resultOfHashCheck.rows.length === 0) {
                            //safe
                            //console.log("url safe")
                        } else {
                            //ALERT
                      
                            logger.discordInfoLogger.info({type: "alertbadurl",
                            message: currentUrl,
                            threat: resultOfHashCheck.rows[0].threat})

                        }
                    }).catch((hashcheckerror) => {
                        logger.discordErrorLogger.error({type: "checkbadurlfail", message: hashcheckerror})
                    })
                })

            })
    
    //        logger.discordInfoLogger.info({type: "links", message: cleanedArrayOfHashes, links: arrayOfUrls})
        }
    }
    
  
}