const Discord = require('discord.js');
const client = new Discord.Client();
const { config } = require('./config.json');
//const prefix = "shake ";
//const token = process.env.BOT_TOKEN;
//var fs = require('fs'); 
import { appendFile } from 'fs';

import { commandHandler } from "./modules/commandhandler"; 

//datadog
var StatsD = require('node-dogstatsd').StatsD;
var dogstatsd = new StatsD();

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
  await client.user.setActivity(`a! help`, {type: 'LISTENING'})
//  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);
}

function logFloorGangText(appendtxt) {
  
  bruhhasadate();

  finalfswrite =fsdateObj.getUTCHours() + ":" +fsdateObj.getUTCMinutes() + ":" +fsdateObj.getUTCSeconds()  + " - " + appendtxt + "\r\n";

  appendFile( "logs/" + fsnewdate + '.log.txt', finalfswrite, function (err) {
    if (err) return console.log(err);
    //console.log('Appended!');
 });
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  
  setPresenceForAdora();
});

client.on('message', async message => {

  dogstatsd.increment('adorabot.client.message');
  commandHandler(message,client,config,cassandraclient,dogstatsd)

  setPresenceForAdora();

});

client.on("invalidated", () => {
  console.log("This client session has been invalidated. Exiting.")
  process.exit(1)
}
)

client.login(config.token);
