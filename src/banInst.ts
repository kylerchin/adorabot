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
      "GUILD_BANS"
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
import { runOnStartup, everyServerRecheckBans, unBanOnAllAdoraSubbedServers } from "./modules/moderation";
import { onMessageForQR, onMessageUpdateForQR } from './modules/antiLoginQRCode';
import { updateDiscordBotsGG, updateDatadogCount, updateDatadogCountRateLimited } from "./modules/uploadStatsToBotsGg"
import { Message } from 'discord.js'
//datadog
import {dogstatsd} from './modules/dogstats'
import { alertBotAdder } from './modules/alertBotAdder';
import { listChartsDownload } from './modules/billboard';
import { createDatabase } from './modules/antiPhishingLinks';


runOnStartup(cassandraclient, client)

client.everyServerRecheckBansOnThisShard = async () => {
  everyServerRecheckBans(cassandraclient, client, false);
  //3rd argument is if the function should recheck Unkown Bans
}

client.everyServerRecheckBansOnThisShardWithUnknownBans = async () => {
  everyServerRecheckBans(cassandraclient, client, true);
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
  await runOnStartup(cassandraclient, client)
}

client.on("debug",async (info) => {
try {
  const logDebug = await logger.discordDebugLoggerNoConsole.debug({clientEvent: "debug", debugInfo: info, type: "clientdebug"});
  console.log(info)
  tracer.inject(span,'log',logDebug)
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
    client.everyServerRecheckBansOnThisShard();
    console.log(`Logged in as ${client.user.tag}!`)
    await logger.discordInfoLogger.info(`Ban Daemon Logged in as ${client.user.tag}!`, { type: 'clientReady'});
    const howManyUsersFam = `Ban Daemon Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
    await logger.discordInfoLogger.info(howManyUsersFam, {type: 'clientReady'});
      
    //set the presence, create moderation databases and then check all servers for ban updates, and then upload guild count
  }
  catch (errorStart) {
    console.log(errorStart)
  }

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


client.on("invalidated", () => {
  console.log("This client session has been invalidated. Exiting.")
  process.exit(1)
}
)

client.login(config.token);
