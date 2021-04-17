const Discord = require('discord.js');
var client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], intents: Discord.Intents.NON_PRIVILEGED, retryLimit: Infinity});
const { config } = require('./config.json');
import {logger} from './modules/logger'
//const prefix = "shake ";
//const token = process.env.BOT_TOKEN;
//var fs = require('fs'); 
import { appendFile } from 'fs';

import { commandHandler } from "./modules/commandhandler"; 
import { runOnStartup, everyServerRecheckBans } from "./modules/moderation";
import {updateDiscordBotsGG} from "./modules/uploadStatsToBotsGg"
import { onMessageForQR, onMessageUpdateForQR } from './modules/antiLoginQRCode';

//const discordbots = require('discord.bots.gg')
//const dbots = new discordbots(config.clientid, config.discordbotsggapitoken)

//datadog
var StatsD = require('hot-shots'),
dogstatsd = new StatsD({
    port: 8020,
    globalTags: { env: process.env.NODE_ENV }
});

var fsdateObj = new Date();
var fsmonth;
var fsday;
var fsyear;

var finalfswrite;

var fsnewdate;

var fshour;

let fsnewfilename = "bruh";

const cassandra = require('cassandra-driver');

const cassandraclient = new cassandra.Client({
  contactPoints: config.cassandra.contactPoints,
  localDataCenter: config.cassandra.localDataCenter,
  authProvider: new cassandra.auth
   .PlainTextAuthProvider(config.cassandra.plainTextUsername, config.cassandra.plainTextPassword)
});

client.everyServerRecheckBansOnThisShard = async () => {
  everyServerRecheckBans(cassandraclient, client);
}

client.setPresenceForAdora = async () => {
  await setPresenceForAdora()
}

function bruhhasadate() {
  fsdateObj = new Date();
  fsmonth =fsdateObj.getUTCMonth() + 1; //months from 1-12
  fsday =fsdateObj.getUTCDate();
  fsyear =fsdateObj.getUTCFullYear();
  fshour = fsdateObj.getUTCHours();

  //console.log("Current time: "  + fsdateObj.getUTCHours() + ":" +fsdateObj.getUTCMinutes() + ":" +fsdateObj.getUTCSeconds());

  fsnewdate = fsyear + "-" + fsmonth + "-" + fsday;

  fsnewfilename = fsnewdate + "-" + fshour + "hr";

  return fsnewfilename;
}

async function setPresenceForAdora() {
  // Set the client user's presence

  client.user.setPresence({ activities: [{ name: 'a!help \n 💜 Invite me to your server please! do a!invite' }], status: 'online' });
}

function logFloorGangText(appendtxt) {
  
  bruhhasadate();

  finalfswrite =fsdateObj.getUTCHours() + ":" +fsdateObj.getUTCMinutes() + ":" +fsdateObj.getUTCSeconds()  + " - " + appendtxt + "\r\n";

  appendFile( "logs/" + fsnewdate + '.log.txt', finalfswrite, function (err) {
    if (err) return console.log(err);
    //console.log('Appended!');
 });
}

async function moderationCassandra() {
  await runOnStartup(cassandraclient, client)
}

client.on("debug",async (info) => {
  await logger.discordDebugLogger.debug({clientEvent: "debug", debugInfo: info, type: "clientdebug"});
  //console.log(info)
})
client.on("warn",async (info) => {
  await logger.discordWarnLogger.warn({clientEvent: "warn", warnInfo: info, type: "clientWarn"});
})

client.on('ready',async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  await logger.discordInfoLogger.info(`Logged in as ${client.user.tag}!`, { type: 'clientReady'});
  const howManyUsersFam = `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  await logger.discordInfoLogger.info(howManyUsersFam, {type: 'clientReady'});
  
  await setPresenceForAdora();

    //ban list
    try {moderationCassandra()} catch (error38362) {
      console.error(error38362)
    }

    //dbots.postStats(client.guilds.size, client.shard.count, client.shard.id)
    
    await updateDiscordBotsGG(client,config)
});

client.on('rateLimit', async rateLimitInfo => {
  await logger.discordWarnLogger.warn({ clientEvent: 'rateLimit', rateLimitInfo: rateLimitInfo, type: 'rateLimit' });
 // console.log(`Rate Limited! for ${rateLimitInfo.timeout} ms because only ${rateLimitInfo.limit} can be used on this endpoint at ${rateLimitInfo.path}`)
})

client.on('guildCreate', async guild => {
  await updateDiscordBotsGG(client,config)
  await logger.discordInfoLogger.info({message: `guild id ${guild.id} added to the bot`, type: "guildCreate", guildObject: guild})
  await client.shard.broadcastEval('this.everyServerRecheckBansOnThisShard()');
})

client.on('guildDelete', async guild => {
  await updateDiscordBotsGG(client,config)
  await logger.discordInfoLogger.info({message: `guild id ${guild.id} removed from the bot`, type: "guildDelete", guildObject: guild})
  await client.shard.broadcastEval(`this.everyServerRecheckBansOnThisShard()`);
})

client.on('messageUpdate', async (oldMessage, newMessage) => {
  await onMessageUpdateForQR(oldMessage, newMessage)
})

client.on('message', async message => {

  dogstatsd.increment('adorabot.client.message');
  try {
    commandHandler(message,client,config,cassandraclient,dogstatsd)
  }
    catch {
      console.log("Command failed");
    }

    await onMessageForQR(message)
  //setPresenceForAdora();
});

client.on("invalidated", () => {
  console.log("This client session has been invalidated. Exiting.")
  process.exit(1)
}
)

client.login(config.token);
