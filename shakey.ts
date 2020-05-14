const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');
//var fs = require('fs'); 
import { appendFile } from 'fs';

var fsdateObj = new Date();
const illegalChannels = ["709130030164475907"]
var fsmonth;
var fsday;
var fsyear;

var finalfswrite;

var fsnewdate;

var inviteCounterForServer;

var illegalPrint;

let commandLower = "";

var burnlanguagelmao;

var bruhserverlog;

var bruhserverid;

var bruhservername;

var msgnextlog;

function logFloorGangText(appendtxt) {
  fsdateObj = new Date();
  fsmonth =fsdateObj.getUTCMonth() + 1; //months from 1-12
  fsday =fsdateObj.getUTCDate();
  fsyear =fsdateObj.getUTCFullYear();

  finalfswrite = "";

  console.log("Current time: "  + fsdateObj.getUTCHours() + ":" +fsdateObj.getUTCMinutes() + ":" +fsdateObj.getUTCSeconds());

  fsnewdate = fsyear + "-" + fsmonth + "-" + fsday;

  finalfswrite =fsdateObj.getUTCHours() + ":" +fsdateObj.getUTCMinutes() + ":" +fsdateObj.getUTCSeconds()  + " - " + appendtxt + "\r\n";

  appendFile( "logs/" + fsnewdate + '.log.txt', finalfswrite, function (err) {
    if (err) return console.log(err);
    console.log('Appended!');
 });
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
});

client.on('message', async msg => {
  inviteCounterForServer = 0;
  illegalPrint = "";
  //check msg starts with prefix, user not a bot
  if (!(!msg.content.toLowerCase().startsWith(prefix) || msg.author.bot)) {
    if (true) {
      //message legal, proceed kind user.
      //parse out args and command
      const args = msg.content.slice(prefix.length).split(' ');
      const command = args.shift().toLowerCase();
      console.log("Command is " + command)
      commandLower =  command.toLowerCase;

      //journalist check commands
      if (command === 'user') {
        if (!args.length) {
          return msg.channel.send(`Please provide a valid user id, ${msg.author}!`);
        }
        else {
          return msg.channel.send(args[0]);
        }
      }

      if(command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await msg.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
      }
  
      if(command === "win") {
        return msg.reply("Another win for Sweden! :flag_se:")
      }

      if (command === 'guild' || command === 'server') {
        if (!args.length) {
          return msg.channel.send(`Please provide a valid guild id, ${msg.author}!`);
        }
        else {
          return msg.channel.send('bar');
        }}

        //Count number of Invites
        //if command is invites
      if (command === "invites") {
        //if server is DM
        if (msg.guild == null) {
          return msg.reply("BRUH, this a DM?")
        }
        else {
          msg.guild.fetchInvites()
          .then(invites => {return msg.channel.send("Found " + invites.size + " invites.")})
        .catch(console.error);
        }
      }

      if (msg.content === "Shake burn" || command === "burn" || command === "Burn" || commandLower === "burn" || commandLower === "destroyallinvites" || commandLower === "burnallinvites"|| command === "burnallinvites"|| commandLower === "burnallinvite" || commandLower === "rmallinvites") {
        if (msg.guild == null) {
          //this a DM
          return msg.reply("BRUH, this a DM?")
        } else {
          //server yes
                  // Fetch invite creator by their id
        console.log("fetching invites")
        msg.guild.fetchInvites()
        .then(
          invites => invites.forEach(function(eachInviteBurn){ 
            //if no invites deteced
            if (invites.size == 0) {
              return msg.channel.send("No valid invites found to burn! Looks like an empty bonfire....")
            } else
            {
            burnlanguagelmao = "eachinviteburn" + eachInviteBurn.code + "{ maxage" + eachInviteBurn.maxAge + "}" +
             " expires at: " + eachInviteBurn.expiresAt + 
              "{created at " + eachInviteBurn.createdAt + "}" + 
              " { invited by " + eachInviteBurn.inviter + "}" +
              "uses:" + eachInviteBurn.uses;
            console.log(burnlanguagelmao)
            logFloorGangText(burnlanguagelmao);
            eachInviteBurn.delete("Purged by Shakey via Fl00r!");
            return msg.channel.send("BURNED " + eachInviteBurn.code + "!");
            }
        }) 
        )
        .catch(console.error);
        }
        //message.channel.send(`First argument: ${args[0]}`);
      }
    }}
 //commands end bracket
  
  if (msg.content === 'tambourine shake') {
    msg.reply('Shakey shaky!');
  }

  //if DM 
  if (msg.guild == null) {
    bruhserverlog = "{Server:DM}";
  } else {
    bruhserverid = msg.guild.id;
    bruhservername = msg.guild.name;
    bruhserverlog = "[Server:" + bruhserverid + "|" + bruhservername + "]";
  }
  msgnextlog =  illegalPrint + "User:" + msg.author + ")" + msg.cleanContent + " [Channel:" + msg.channel + "] " + "{" + msg.content + "}" + "~ {Username:" + msg.author.username +  "|Tag:" + msg.author.tag + "}" + bruhserverlog + "{Msg id:" + msg.id + "}" + "Embed:" + msg.embeds;
  console.log(msgnextlog);
  logFloorGangText(msgnextlog);
},

client.login(token));