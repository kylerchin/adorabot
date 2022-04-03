
import {logger,tracer,span} from './logger'

var twelvehours = 12 * 60 * 60 * 1000

const NodeCache = require( "node-cache" );
const adoravotesremindedalready = new NodeCache({ stdTTL: 1000, checkperiod: 1 });


export function voteReminderRuntime(cassandraclient,client) {
    logger.discordInfoLogger.info("recievedfirstmsg", {type: 'votereminddebug'});

    cassandraclient.execute("SELECT * FROM adoravotes.pendingvotereminders", [], {prepare: true})
    .then((adoravotescassandra) => {
    
      var latestTopggVoteTimes = {

      }

      var latestDblVoteTimes = {

      }

      adoravotescassandra.rows.forEach((eachRow) => {
        if (eachRow.service == "topgg") {
          latestTopggVoteTimes[eachRow.userid] = eachRow.time.getDate().getTime();
        } else {
          latestDblVoteTimes[eachRow.userid] = eachRow.time.getDate().getTime();
        }
      })

      adoravotescassandra.rows.forEach((eachRow) => {
        
        // check if more than 12 hours ago

        if (eachRow.time.getDate().getTime() < Date.now() - twelvehours) {
         var valueofremindedalready = adoravotesremindedalready.get(`${eachRow.time}-${eachRow.service}`);

          var unixtimeofvote = eachRow.time.getDate().getTime()

         if (valueofremindedalready == undefined) {

          //save in cache
          adoravotesremindedalready.set(`${eachRow.time}-${eachRow.service}`,true);

          cassandraclient.execute("DELETE FROM adoravotes.pendingvotereminders WHERE time = ?", [
            eachRow.time
          ], {prepare: true})
          .then((deleterowsuccess) => {
            if (latestTopggVoteTimes[eachRow.userid] == unixtimeofvote || latestDblVoteTimes[eachRow.userid] == unixtimeofvote) {
                logger.discordInfoLogger.info("islatestvoteremind", {type: 'votereminddebug2'});
              client.users.fetch(eachRow.userid).then((user) => {
                try {
                  var stringToSend;

                  if (eachRow.service === 'topgg') {
                    stringToSend = "Thank you so much for voting earlier for Adora! You're eligable to vote again on Top.gg! \nEvery vote is 1 ticket in the monthly nitro giveaway! \n  Here's the link if you need it :purple_heart:  https://top.gg/bot/737046643974733845/vote"
                  }
                  if (eachRow.service === "discordbotlist") {
                    stringToSend = "Thank you so much for voting earlier for Adora! You're eligable to vote again on Discord Bot List! \nEvery vote is 1 ticket in the monthly nitro giveaway! \n Here's the link if you need it :purple_heart: https://discordbotlist.com/bots/adora-ahelp/upvote"
                  }
                  user.send(stringToSend);	
                } catch (err){
                  console.error(err);
                  logger.discordInfoLogger.info(err, {type: 'votereminddebug2'});
                }
            })
            .catch(error => {
              console.error(error)
            })
            } else {
                logger.discordInfoLogger.info("isnotlatestvoteremind", {type: 'votereminddebug2'});
            }
        

         });
        }


      }
      
    });

    })
    .catch(error => {
      console.error(error)
    });
  }