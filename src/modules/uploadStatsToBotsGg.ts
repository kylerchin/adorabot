var axios = require('axios');
var qs = require('qs');
import {logger,tracer,span} from "./logger"
// Rate Limit Set
const rateLimitsInShard = new Set();

var StatsD = require('hot-shots'),
dogstatsd = new StatsD({
    port: 8125,
    globalTags: { env: process.env.NODE_ENV }
});
  
export async function updateDatadogCount(client,config,cassandraclient) {

  tracer.trace('updateDatadogCount', () => {

  var queryNumberOfSubscribedServers = "SELECT COUNT(*) FROM adoramoderation.guildssubscribedtoautoban"
        var parametersForSubscribedServers = [true]
        var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"

  if(true) {
    const promises = [
      client.shard.fetchClientValues('guilds.cache.size'),
      client.shard.broadcastEval(client => client.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)),
      cassandraclient.execute(queryNumberOfSubscribedServers),
      cassandraclient.execute(lookuphowmanybannedusersquery)
 ];

  return Promise.all(promises)
      .then(async (results) => {
          const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
          const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);
          var returnSubscribedServersCount = results[2]
          var subscribedServerCount = returnSubscribedServersCount.rows[0].count.low
          var returnBanDatabaseAmount = results[3]
          var numberofrowsindatabase = returnBanDatabaseAmount.rows[0].count.low

          dogstatsd.gauge('adorabot.totalstats.totalGuilds', totalGuilds);
          dogstatsd.gauge('adorabot.totalstats.totalMembers', totalMembers);
          dogstatsd.gauge('adorabot.totalstats.totalShards', client.shard.count);
          dogstatsd.gauge('adorabot.totalstats.subscribedBanList', subscribedServerCount)
          dogstatsd.gauge('adorabot.totalstats.adoraBanned', numberofrowsindatabase)
          //return msg.channel.send(`Server count: ${totalGuilds}\nMember count: ${totalMembers}\nNumber of Shards: ${client.shard.count}\nNumber of Bans in Database:${numberofrowsindatabase}`);

  })

}
  })
}

export async function updateDiscordBotsGG(client,config) {

  tracer.trace('updateDiscordBotsGG', () => {
    
 

  if(true) {
    const promises = [
      client.shard.fetchClientValues('guilds.cache.size'),
      client.shard.broadcastEval(client => client.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0))
 ];

  return Promise.all(promises)
      .then(async (results) => {
          const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
          const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);

          dogstatsd.gauge('adorabot.totalstats.totalGuilds', totalGuilds);
          dogstatsd.gauge('adorabot.totalstats.totalMembers', totalMembers);
          dogstatsd.gauge('adorabot.totalstats.totalShards', client.shard.count);
          //return msg.channel.send(`Server count: ${totalGuilds}\nMember count: ${totalMembers}\nNumber of Shards: ${client.shard.count}\nNumber of Bans in Database:${numberofrowsindatabase}`);
          var data = qs.stringify({
            'guildCount': totalGuilds,
           'shardCount': client.shard.count 
           });  

           var dataDBL = qs.stringify({
            'guilds': totalGuilds,
           'users': totalMembers 
           });  


var uploadconfig = {
method: 'post',
url: 'https://discord.bots.gg/api/v1/bots/' + client.user.id + '/stats?',
headers: { 
'Authorization': config.discordbotsggapitoken, 
'Content-Type': 'application/x-www-form-urlencoded'
},
data : data
};

var uploaddiscordbotlistconfig = {
  method: 'post',
  url: 'https://discordbotlist.com/api/v1/bots/' + client.user.id + '/stats?',
  headers: { 
  'Authorization': config.discordbotlisttoken, 
  'Content-Type': 'application/x-www-form-urlencoded'
  },
  data : dataDBL
}

await axios(uploaddiscordbotlistconfig)
      .then(async (response) => {
       // await logger.discordDebugLogger.debug({type: "uploadStatsToDiscordBotList", response: response})
      }).catch(
        async (error) => {
          //console.log(error);
          await logger.discordWarnLogger.warn({type: "uploadStatsToDiscordBotList", error: error})
          }
      )

await axios(uploadconfig)
.then(async (response) => {
//console.log(JSON.stringify(response.data));
//await logger.discordDebugLogger.debug({type: "uploadStatsToBotsGg", response: response})
})
.catch(async (error) => {
//console.log(error);
await logger.discordWarnLogger.warn({type: "uploadStatsToBotsGg", error: error})
});
      })
      .catch(async (error) => {
        //console.log(error);
        await logger.discordWarnLogger.warn({type: "uploadStatsToBotsGg", error: error})
      });

      


  }

})      

}

export async function updateDiscordBotsGGRateLimited(client,config) {
  //has the system recently uploaded stats to discord bots gg
  if (rateLimitsInShard.has("discordbotsgg")) {
  } else {
    Promise.all([updateDiscordBotsGG(client,config),
    // Adds the user to the set so that they can't talk for 7sec
    rateLimitsInShard.add("discordbotsgg")]);
    setTimeout(() => {
      // Removes the user from the set after 7sec
      rateLimitsInShard.delete("discordbotsgg");
    }, 7000);
  }
}


export async function updateDatadogCountRateLimited(client,config,cassandraclient) {
  //has the system recently fetched the database
  if (rateLimitsInShard.has("datadogcount")) {
  } else {
    Promise.all([updateDatadogCount(client,config,cassandraclient),
    rateLimitsInShard.add("datadogcount")]);
    setTimeout(() => {
      // Removes rate limit after 1 sec
      rateLimitsInShard.delete("datadogcount");
    }, 1000);
  }
}