const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');
//var fs = require('fs'); 
import { appendFile } from 'fs';
const editJsonFile = require("edit-json-file");

//Stores Server wide settings such as shake set lmao
let serverSettings = editJsonFile(`${__dirname}/settings/servers.json`);
serverSettings.set("planet", "Earth");
serverSettings.save();

//datadog
var StatsD = require('node-dogstatsd').StatsD;
var dogstatsd = new StatsD();

//Increment a counter.
//dogstatsd.increment('page.views');

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

let filejsonmsglog = editJsonFile(`${__dirname}/foo.json`);

var bruhserverlog;

var bruhserverid;

var bruhservername;

var msgnextlog;

function genHexString(len) {
  const hex = '0123456789abcdef';
  let output = '';
  for (let i = 0; i < len; ++i) {
      output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

var fshour;

let fsnewfilename = "bruh";

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

function logFloorGangText(appendtxt) {
  
  bruhhasadate();

  finalfswrite =fsdateObj.getUTCHours() + ":" +fsdateObj.getUTCMinutes() + ":" +fsdateObj.getUTCSeconds()  + " - " + appendtxt + "\r\n";

  appendFile( "logs/" + fsnewdate + '.log.txt', finalfswrite, function (err) {
    if (err) return console.log(err);
    //console.log('Appended!');
 });
}

function logEventsJSON() {
  /*
  filejsonmsglog = editJsonFile(`${__dirname}/logs/` + bruhhasadate());

  let eventBruhId = genHexString("40")

  .set("planet", "Earth");
  */
}

const helpFrontPage = [
  "`shake help`: Sends this message.",
  "`shake burn`: Burns all invites! Use this command with caution. You must have `shake rule everyoneburn true` on for your guild or already be able to delete invites via the Server Settings",
  "`shake invites`: Counts number of invites in your server.",
  "`shake ping`: Pong!",
  "`shake rule`: Has settings, do `shake help rule` for more info.",
  "`shake win`: ABSOLUTE WIN!",
  "`shake inviteme`: Add Tambourine to your next server!"
]

let helpFrontPageCombined = "";

//combine all messages to prevent spam
helpFrontPage.forEach(element => helpFrontPageCombined = helpFrontPageCombined + " \n " + element);

// First, this must be at the top level of your code, **NOT** in any event!
const inviteMeRecently = new Set();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
});

client.on('message', async msg => {
  dogstatsd.increment('tambourine.client.message');
  inviteCounterForServer = 0;
  illegalPrint = "";
  //check msg starts with prefix, user not a bot
  if (!(!msg.content.toLowerCase().startsWith(prefix) || msg.author.bot)) {
    if (true) {
      console.log("prefix true")
      //log triggerprefix tambourine
      dogstatsd.increment('tambourine.triggerprefix');
      //message legal, proceed kind user.
      //parse out args and command
      const args = msg.content.slice(prefix.length).split(' ');
      const command = args.shift().toLowerCase();
      console.log("Command is " + command)
      commandLower =  command.toLowerCase;

      if (command === "inviteme") {

        if (inviteMeRecently.has(msg.author.id)) {
         // msg.channel.send("Wait 1 minute before getting typing this again. - " + msg.author);
        } else {

              // the user can type the command ... your command code goes here :)
              msg.channel.send("I'm thrilled I can be part of your next community! 😊🌌 \n https://discord.com/oauth2/authorize?client_id=711405398506078260&scope=bot&permissions=8");

            // Adds the user to the set so that they can't talk for 7sec
            inviteMeRecently.add(msg.author.id);
            setTimeout(() => {
              // Removes the user from the set after 7sec
              inviteMeRecently.delete(msg.author.id);
            }, 7000);
        }
      }

      //BIG FAT HELP COMMAND
      if (command == "help") {
        if (args[0] === "rule" || args[0] === "rules") {
          msg.channel.send("`shake rule everyoneburn true` to allow everyone to use `shake burn` which burns all invites. \n `shake rule everyoneburn false` to only allow users that can already delete invites via server settings to execute `shake burn`");
          msg.channel.send('`shake rule everyoneburn` to check the status of the rule.');
        } else {
          //No valid arg, show front page instead
          msg.author.send(helpFrontPageCombined);

          //if not DMs
          if (!(msg.guild == null)) {
            //Tell user to check DMs
          msg.reply("Check your DMs!");
          }
        }
      }

      //journalist check commands
     /* if (command === 'user') {
        if (!args.length) {
          return msg.channel.send(`Please provide a valid user id, ${msg.author}!`);
        }
        else {
          return msg.channel.send(args[0]);
        }
      }*/

      if ((command === "rule" || command === "rules") && args[0] == "everyoneburn") {

        if (msg.guild == null) {
          return msg.reply("BRUH, this a DM?");
        }

       if( msg.member.hasPermission('ADMINISTRATOR')) {
           //If it's actually a server
        //only admins can toggle this
          if (args[1] === "true" || args[1] === "True" || args[1] === "yes" || args[1] === "y") {
            //Allow Everyone on this server to burn
            serverSettings.set("servers." + msg.guild.id + ".everyoneburn", true);
            serverSettings.save();
            msg.reply("Everyone in this guild can now burn all invites.");
          } else {
           if (args[1] === "false" || args[1] === "no" || args[1] === "n") {
            //Prevent anyone withoug MANAGE_GUILD on this server to burn
            serverSettings.set("servers." + msg.guild.id + ".everyoneburn", false);
            serverSettings.save();
            msg.reply("Now, only those that can already edit the invites tab can burn all invites.");
          }
        }
        }
        //not an admin
        else {
          msg.reply("Only Admins can toggle `everyoneburn`");
        }
      }

      if(command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await msg.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
      }
  
      if(command === "win") {
        return msg.channel.send("Another win for Sweden! :flag_se:");
      }

      if(command === "scan") {
        return msg.channel.send("scan");
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
      if (command === "invites" || command === "invite") {
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

      if (msg.content === 'tambourine shake' || command === "shake") {
        msg.reply('Shakey shaky!');
      }

      if (msg.content === "Shake burn" || command === "burn" || command === "Burn" || commandLower === "burn" || commandLower === "destroyallinvites" || commandLower === "burnallinvites"|| command === "burnallinvites"|| commandLower === "burnallinvite" || commandLower === "rmallinvites") {
        if (msg.guild == null) {
          //this a DM
          dogstatsd.increment('tambourine.burn.dm');
          return msg.reply("BRUH, this a DM?")
        } else {
          //server yes
                  // Fetch invite creator by their id
        console.log("fetching invites")
        msg.guild.fetchInvites()
        .then(
          invites => 
          { 
               if( msg.member.hasPermission('MANAGE_GUILD') || serverSettings.get("servers." + msg.guild.id + ".everyoneburn") === true ) {
              //if(!msg.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
              //return msg.reply("Sorry, you don't have permissions to use this! You need the role `TamboBurn` to delete all invites.");

              if (invites.size == 0) {
                dogstatsd.increment('tambourine.burn.empty');
                msg.channel.send("No valid invites found to burn! Looks like an empty bonfire....");
                return msg.channel.send("Admins can use `shake rule everyoneburn true` to allow everyone to burn messages and `shake rule everyoneburn false` to only allow those that can already delete invites to burn");
              } 

              dogstatsd.increment('tambourine.burn.success');
              invites.forEach(function(eachInviteBurn){ 
                dogstatsd.increment('tambourine.burn.inviteburn');
                console.log("invites_size" + invites.size);
                burnlanguagelmao = "eachinviteburn" + eachInviteBurn.code + "{ maxage" + eachInviteBurn.maxAge + "}" +
                " expires at: " + eachInviteBurn.expiresAt + 
                  "{created at " + eachInviteBurn.createdAt + "}" + 
                  " { invited by " + eachInviteBurn.inviter + "}" +
                  "uses:" + eachInviteBurn.uses;
                console.log(burnlanguagelmao)
                logFloorGangText(burnlanguagelmao);
                eachInviteBurn.delete("Purged by Shakey via Fl00r!");
                msg.channel.send("BURNED " + eachInviteBurn.code + "!");
                
              })

              return msg.channel.send("Admins can use `shake rule everyoneburn true` to allow everyone to burn messages and `shake rule everyoneburn false` to only allow those that can already delete invites to burn");
            } else {
              msg.reply("You need `MANAGE_GUILD` priv or `everyoneburn` needs to be `true`!");
              return msg.channel.send("Admins can use `shake rule everyoneburn true` to allow everyone to burn messages and `shake rule everyoneburn false` to only allow those that can already delete invites to burn");
            }
          }
        )
        .catch(console.error);
        }
        //message.channel.send(`First argument: ${args[0]}`);
      }
    }}
 //commands end bracket


  //It's JSON my dudes
  //set the file to write to
  filejsonmsglog = editJsonFile(`${__dirname}/logs/json/` + bruhhasadate() + ".log.json");
  //unique ID for the event
  let eventBruhId = genHexString("40");
  //console.log(eventBruhId + ":" + msg.content);
  //WRITE THAT DOWN!
  //console.log(filejsonmsglog);
  filejsonmsglog.set(eventBruhId+".type", "msg");
  filejsonmsglog.set(eventBruhId+".time", new Date());
  //filejsonmsglog.set(eventBruhId+".message.author", msg.author);
    if (true) {
      //if DM 
      if (msg.guild == null) {
        bruhserverlog = "{Server:DM}";
        filejsonmsglog.set(eventBruhId+".message.bruh.dm", true);
      } else {
        bruhserverid = msg.guild.id;
        bruhservername = msg.guild.name;
        bruhserverlog = "[Server:" + bruhserverid + "|" + bruhservername + "]";
        filejsonmsglog.set(eventBruhId+".message.bruh.dm", false);

        //Stores server names
        filejsonmsglog.set(eventBruhId+".message.guild.id", msg.guild.id);
        filejsonmsglog.set(eventBruhId+".message.guild.name", msg.guild.name);
      }
      

      filejsonmsglog.set(eventBruhId+".message.author.id", msg.author.id);
      filejsonmsglog.set(eventBruhId+".message.author.bot", msg.author.bot);
      filejsonmsglog.set(eventBruhId+".message.author.username", msg.author.username);
      filejsonmsglog.set(eventBruhId+".message.author.discriminator", msg.author.discriminator);
      filejsonmsglog.set(eventBruhId+".message.channel.id", msg.channel.id);
      filejsonmsglog.set(eventBruhId+".message.author.avatarURL", msg.author.avatarURL);
      filejsonmsglog.set(eventBruhId+".message.author.createdTimestamp", msg.author.createdTimestamp);
    }

  filejsonmsglog.set(eventBruhId+".message.content", msg.content);
  filejsonmsglog.set(eventBruhId+".message.tag", msg.tag);
  filejsonmsglog.set(eventBruhId+".message.embeds", msg.embeds);
  filejsonmsglog.set(eventBruhId+".message.id", msg.id);
  //filejsonmsglog.set(eventBruhId+".message.guild", msg.guild);
  filejsonmsglog.set(eventBruhId+".message.attachments", msg.attachments);
  filejsonmsglog.save();

  //console.log(filejsonmsglog.get());

  msgnextlog =  illegalPrint + "User:" + msg.author + ")" + msg.cleanContent + " [Channel:" + msg.channel + "] " + "{" + msg.content + "}" + "~ {Username:" + msg.author.username +  "|Tag:" + msg.author.tag + "}" + bruhserverlog + "{Msg id:" + msg.id + "}" + "Embed:" + msg.embeds;

  console.log(msgnextlog);
  logFloorGangText(msgnextlog);
},

client.login(token));