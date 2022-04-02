import editJsonFile = require("edit-json-file");
var startupTime = Date.now()
var recievedFirstMessageState:boolean = false;

const regexBanRoute = /\/guilds\/\d*\/bans\/:id/g;

// shut up warning
process.setMaxListeners(0);
let fileOfBanTimeouts = editJsonFile(`${__dirname}/../putgetbanstimeout.json`);
const Discord = require('discord.js');
const { DiscordTogether } = require('discord-together');
var elapsedTimeFirstMsg;
var client = new Discord.Client(
  { 
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
    intents: [
      "GUILDS",
      "GUILD_BANS",
      "GUILD_EMOJIS_AND_STICKERS",
      "GUILD_INTEGRATIONS",
      "GUILD_WEBHOOKS",
      "GUILD_INVITES",
      "GUILD_VOICE_STATES",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "GUILD_MESSAGE_TYPING",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
      "DIRECT_MESSAGE_TYPING"
    ],
   waitGuildTimeout: 1000
  });
  client.discordTogether = new DiscordTogether(client);
const { config } = require('./../config.json');
import {logger,tracer,span} from './modules/logger'
import {processInteraction} from './modules/interactions'
import {processmalwarediscordmessage} from './modules/scanurl'
import {cassandraclient} from './modules/cassandraclient'
//const prefix = "shake ";
//const token = process.env.BOT_TOKEN;
//var fs = require('fs'); 
import { appendFile } from 'fs';
import { commandHandler } from "./modules/commandhandler"; 
import { unBanOnAllAdoraSubbedServers } from "./modules/moderation";
import { onMessageForQR, onMessageUpdateForQR } from './modules/antiLoginQRCode';
import { updateDiscordBotsGG, updateDatadogCount, updateDatadogCountRateLimited } from "./modules/uploadStatsToBotsGg"
import { Message } from 'discord.js'
//datadog
import {dogstatsd} from './modules/dogstats'
import { alertBotAdder } from './modules/alertBotAdder';
import { listChartsDownload } from './modules/billboard';
import { createDatabase } from './modules/antiPhishingLinks';
const NodeCache = require( "node-cache" );
const adoravotesremindedalready = new NodeCache({ stdTTL: 1000, checkperiod: 1 });


client.everyServerRecheckBansOnThisShard = async () => {
  //everyServerRecheckBans(cassandraclient, client, false);
  //3rd argument is if the function should recheck Unkown Bans
}

client.everyServerRecheckBansOnThisShardWithUnknownBans = async () => {
  //everyServerRecheckBans(cassandraclient, client, true);
  //3rd argument is if the function should recheck Unkown Bans
}

interface unbanSubArgsInterface {
  userid: string;
  reason: string;
}



client.unBanOnAllAdoraSubbedServers = function async (unbanSubArgs: unbanSubArgsInterface) {
  var unbanSubArgsModified:any = unbanSubArgs
  unbanSubArgsModified.client = client
  unBanOnAllAdoraSubbedServers(unbanSubArgsModified)
}

client.setPresenceForAdora = async () => {
  await setPresenceForAdora()
}

client.setPresenceForAdoraCustom = async (presencetext) => {
  console.log("inside client var recieved: " + presencetext)
  await setPresenceForAdoraCustom(presencetext)
}

async function setPresenceForAdoraCustom(presencetext) {
   // Set the client user's presence
   client.user.setPresence({ activities: [{ name: presencetext}], status: 'online' });
}

async function setPresenceForAdora() {
  // Set the client user's presence
  client.user.setPresence({ activities: [{ name: 'a!help \n 💜 Invite me to your server please! do a!invite' }], status: 'online' });
}

async function moderationCassandra() {
 // await runOnStartup(cassandraclient, client)
}

  var hasconnected = false;

var twelvehours = 12 * 60 * 60 * 1000

client.on("debug",async (info) => {
try {
  const logDebug = await logger.discordDebugLoggerNoConsole.debug({clientEvent: "debug", debugInfo: info, type: "clientdebug"});
  console.log(info)
  tracer.inject(span,'log',logDebug)

  // in the future... restrict to 1 shard
  try {
    if ( recievedFirstMessageState) {

      await logger.discordInfoLogger.info("recievedfirstmsg", {type: 'votereminddebug'});

      cassandraclient.execute("SELECT * FROM adoravotes.pendingvotereminders", {prepare: true})
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
                client.users.fetch(eachRow.userid).then((user) => {
                  try {
                    var stringToSend;
  
                    if (eachRow.service === 'topgg') {
                      stringToSend = "Thank you so much for voting earlier for Adora! You're eligable to vote again on Top.gg! \nEvery vote is 1 ticket in the monthly nitro giveaway! \n  Here's the link if you need it :purple_heart:  https://top.gg/bot/737046643974733845/vote"
                    }
                    if (eachRow.service === "discordbotlist") {
                      stringToSend = "Thank you so much for voting earlier for Adora! You're eligable to vote again on Discord Bot List! \nEvery vote is 1 ticket in the monthly nitro giveaway! \n Here's the link if you need it :purple_heart: https://discordbotlist.com/bots/adora-ahelp/upvote"
                    }
                    user.send();	
                  } catch (err){
                    console.error(err);
                  }
              })
              .catch(error => {
                console.error(error)
              })
              }
          
  
           });
          }

  
        }
        
      });

      })
      .catch(error => {
        console.error(error)
      })
    }
   
  }
   catch(error) {
     console.error(error)
   }

  //console.log(info)
} catch (hell) {
  console.error(hell)
}
})
client.on("warn",async (info) => {
  const logWarn = await logger.discordWarnLogger.warn({clientEvent: "warn", warnInfo: info, type: "clientWarn"});
  tracer.inject(span,'log',logWarn)
})

client.on('guildMemberAdd', async (member) => {
  //detect if guild has autorespond on member join and send welcome message to guild and or dms

  //detect if guild has autorole on and give the roles needed

  //log to appropriate log channel
})

client.on('ready',async () => {
  try {
    console.log(`Logged in as ${client.user.tag}!`)
    await logger.discordInfoLogger.info(`Logged in as ${client.user.tag}!`, { type: 'clientReady'});
    const howManyUsersFam = `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
    await logger.discordInfoLogger.info(howManyUsersFam, {type: 'clientReady'});
      
    //set the presence, create moderation databases and then check all servers for ban updates, and then upload guild count
      await Promise.allSettled([
        listChartsDownload(),
        setPresenceForAdora(),
        createDatabase(),
        updateDiscordBotsGG(client,config)
      ])
  }
  catch (errorStart) {
    console.log(errorStart)
  }

});

client.on('interactionCreate', async interaction => {
  tracer.trace('interactionCreate',async () => {
 // if (!interaction.isCommand()) return;
  await processInteraction({interaction})
  await dogstatsd.increment('adorabot.interactionCreate');
  });
});

client.on('rateLimit', async rateLimitInfo => {
try { 
  if (rateLimitInfo.route) {
    if (rateLimitInfo.method === 'put') {
      const foundRateLimitAddBan = rateLimitInfo.route.match(regexBanRoute);

      if (foundRateLimitAddBan) {
        var serverId =  rateLimitInfo.route.replace(/\/guilds\//g,'').replace(/\/bans\/:id/g,'')
        fileOfBanTimeouts.set(serverId, {
          time: Date.now(),
          route: rateLimitInfo.route,
          timeout: rateLimitInfo.timeout,
          method: rateLimitInfo.method
        });
        fileOfBanTimeouts.save();
      }
    }
  }

  await logger.discordInfoLogger.warn({ clientEvent: 'rateLimit', rateLimitInfo: rateLimitInfo, type: 'rateLimit' })
  console.log(rateLimitInfo)
 // console.log(`Rate Limited! for ${rateLimitInfo.timeout} ms because only ${rateLimitInfo.limit} can be used on this endpoint at ${rateLimitInfo.path}`)
} catch (ratelimiterr) {
  console.error(ratelimiterr)
}
})

client.on('guildCreate', async guild => {
  await Promise.all[
  updateDiscordBotsGG(client,config),
  alertBotAdder(guild,client),
  logger.discordInfoLogger.info({message: `guild id ${guild.id} added to the bot`, type: "guildCreate", guildObject: guild})
 // client.shard.broadcastEval(client => client.everyServerRecheckBansOnThisShard())
  ]

  updateDatadogCount(client,config)
})

client.on('guildDelete', async guild => {
  updateDiscordBotsGG(client,config)
  await logger.discordInfoLogger.info({message: `guild id ${guild.id} removed from the bot`, type: "guildDelete", guildObject: guild})
 // client.shard.broadcastEval(client => client.everyServerRecheckBansOnThisShard())
  updateDatadogCount(client,config)
})

client.on('messageUpdate', async (oldMessage, newMessage) => {
  //await onMessageUpdateForQR(oldMessage, newMessage)
  processmalwarediscordmessage(newMessage)
})

client.on('guildBanAdd', async (guild, user) => {
  await logger.discordDebugLogger.debug({
    type: "clientGuildBanAdd",
    guild: guild,
    user: user
  });
})

client.on('guildBanRemove', async (guild, user) => {
  await logger.discordDebugLogger.debug({
    type: "clientGuildBanRemove",
    guild: guild,
    user: user
  });
})


client.on('messageCreate', async (message:Message) => {

  if (recievedFirstMessageState === false) {
    recievedFirstMessageState = true;

     elapsedTimeFirstMsg = Date.now() - startupTime
    console.log(`First message in ${elapsedTimeFirstMsg}ms`)
    logger.discordInfoLogger.info(`First message in ${elapsedTimeFirstMsg}ms`)
  }

  try {
    tracer.trace('clientMessage',async () => {
      //const logTrace = logger.info(body);
      //const traceId = logTrace.dd.trace_id;
     await Promise.allSettled[
        commandHandler(message,client,config,dogstatsd,startupTime), 
      //  onMessageForQR(message), 
        processmalwarediscordmessage(message),
        updateDatadogCountRateLimited(client,config),
        dogstatsd.increment('adorabot.client.message')]

        if (message.content === `a!startuptime`) {
          message.reply(`First message in ${elapsedTimeFirstMsg}ms`)
        }

        const isDM: boolean = message.guild === null;

        if (isDM) {
          logger.discordInfoLogger.info({messageObject: message, senderName: message.author.tag, type: "directMessageToAdora"})
        }
      
      // here we are in the context for a trace that has been activated on the scope by tracer.trace

      if (message.guild.available) {
        if (message.guild.me.nickname === null) {
        if (message.guild.me.permissions.has('CHANGE_NICKNAME')) {
        //    if (true) {
            await message.guild.me.setNickname("Adora 앋오라")
            logger.discordInfoLogger.info(`Renamed to correct username in server ${message.guild.name} ID ${message.guild.id}`)
          }
        }
        if (message.guild.me.nickname === undefined) {
        }
        }
    })
    //
  }
    catch {
      console.log("Command failed");
    }

    //await logger.discordSillyLogger.silly(clientMessageToUploadToDatadog);
  
  //setPresenceForAdora();
});

client.on("invalidated", () => {
  console.log("This client session has been invalidated. Exiting.")
  process.exit(1)
}
)

client.login(config.token);
