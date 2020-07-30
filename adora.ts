const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');
//const prefix = "shake ";
//const token = process.env.BOT_TOKEN;
//var fs = require('fs'); 
import { appendFile } from 'fs';
const editJsonFile = require("edit-json-file");

const jsdom = require('jsdom');
var dom = new jsdom.JSDOM();
var window = dom.window;
var document = window.document;

var $ = require('jquery')(window);
console.log('version:', $.fn.jquery)

//datadog
var StatsD = require('node-dogstatsd').StatsD;
var dogstatsd = new StatsD();

//Increment a counter.
//dogstatsd.increment('page.views');

var fsdateObj = new Date();
const illegalChannels = ["709130030164475907"];
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
//
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

const helpFrontPage = [
  "`a! help`: Sends this message.",
  "`a! bbp`: returns Billboard polls to select from.",
  "`a! ping`: Pong!"
]

let helpFrontPageCombined = "";

//combine all messages to prevent spam
helpFrontPage.forEach(element => helpFrontPageCombined = helpFrontPageCombined + " \n " + element);

// First, this must be at the top level of your code, **NOT** in any event!
const inviteMeRecently = new Set();
const activatedFrontHelpRecently = new Set();
const activatedFrontHelpSimp = new Set();

client.on('ready', () => {
    console.log("Command Thread Injest Activated");
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  
  client.user.setActivity(`a! help`, {type: 'LISTENING'})
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);
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

      if(command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await msg.channel.send("Ping?");
        m.edit(`**펑!** Latency is ${m.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
      }

      if (command === "help") {
        msg.channel.send(
          "`a! bbp`: Billboard Polls, run command for more info about each poll\n" +
          "`a ping`: Pong test\n" + 
          "`a bv: Billboard voting, use command to select poll`"
        )
      }

      if (command === "bv") {

        var precurserpoll = "Remember to vote on a different browser, device, incognito mode, or clear cookies! The bot won't let you vote as the same cookie session. If you see \"Thank you, we have counted your vote\", you are repeat voting and your new vote is not counted!\n"

        if (args[0]) {
          if (args[0] === "1") {
            msg.channel.send(precurserpoll + "https://www.billboard.com/articles/columns/pop/9420280/favorite-boy-band-of-all-time-poll")
          } else {
            if (args[0] === "2") {
              msg.channel.send(precurserpoll + "https://www.billboard.com/articles/columns/pop/9418334/favorite-boy-band-album-poll")
            } else {
              msg.channel.send("Select Poll to Vote:\n" + 
          "`a! bv 1`: \"What's Your Favorite Boy Band of All Time?\"\n" + 
          "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" + 
          "*more polls coming soon, go bug kyler lmao*")
            }
          }
        } else {
          msg.channel.send("Select Poll to Vote:\n" + 
          "`a! bv 1`: \"What's Your Favorite Boy Band of All Time?\"\n" + 
          "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" + 
          "*more polls coming soon, go bug kyler lmao*")
        }
      }

      if(command === "bbp") {
        
        if(args[0]) {

          var nameArray = []
        var scoreArray = []

        var polllink = "";

        if (args[0] === "1") {
          polllink = "https://polls.polldaddy.com/vote-js.php?p=10581243"
        } else {
          if (args[0] === "2") {
            polllink = "https://polls.polldaddy.com/vote-js.php?p=10580016"
          } else {
            msg.channel.send("We didn't get a valid link!")
            msg.channel.send("**Choose from the following polls**\n" +
            "`a! bbp 1` : \"What's Your Favorite Boy Band of All Time?\"\n" + 
            "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" + 
            "**Command: `a! bbp <poll-number> <how-many-top-results>`**")
          }
          }

        if (polllink.length > 1) {
    $.get(polllink,  // url
      async function (data, textStatus, jqXHR) {  // success callback
          //alert('status: ' + textStatus + ', data:' + data);
          var output1 = data.slice(106,-112);
          console.log(output1);
          //document.getElementById("parse").innerHTML = output1;

          var $content = $(output1);
          nameArray = []


         $content.each( function () {
          //console.log("hi");
          
          $(this).find(".pds-answer-text").each(function (i,row) {
            var nameAnswer = row.innerHTML
          console.log(nameAnswer)
        nameArray.push(nameAnswer)
        })

        $(this).find(".pds-feedback-per").each(function (i,row) {
          var scoreAnswer = row.innerHTML.replace("&nbsp;","")
        //console.log(nameAnswer)
      scoreArray.push(scoreAnswer)
      })
          })

          //output now
          var pollindex = 0;
          var poll2index = 0;

          var pollResultToDiscord = "";

          var pollResultsFinalArray = []

          nameArray.forEach(message => {
            var nextLinePoll = nameArray[pollindex] + " : " + scoreArray[pollindex]
            pollResultsFinalArray.push(nextLinePoll)
            pollindex = pollindex + 1;
          });

          if (args[1]) {
            console.log("Argument exists")
            pollResultsFinalArray = pollResultsFinalArray.slice(0, parseInt(args[1],10))
          }
          else {
            console.log("No argument")
          }

          pollResultsFinalArray.forEach(message => {
            pollResultToDiscord = pollResultToDiscord + message + "\n"
            poll2index = poll2index + 1;
          });
        
          msg.channel.send(pollResultToDiscord);

       // var regexNames = new RegExp("<span class=\"pds-answer-text\">(\s|\S)*?</span>", "g")
        //var regexPollPer = new RegExp("<span class=\"pds-feedback-per\">(\\s|\\S)*?</span>", "g")

        //console.log(regexNames)

        //nameArray = [...output1.matchAll(regexNames)]
        //scoreArray = [...output1.matchAll(regexPollPer)]

//        console.log(nameArray[0],scoreArray[0])

console.log(nameArray.length)

console.log(nameArray[1])

        /*
          $content.('.pds-answer-text').each(function (i, row)
            {
                
                var pollcatagory =  row.innerHTML
                console.log(pollcatagory)
                nameArray.push(pollcatagory)
            })

$content.$('.pds-question-top').each(function (i, row)
            {
                var polltitle = "Billboard Poll:" + " What’s your favorite boy band of all time?"
                  
            })

            scoreArray = []

            $('.pds-feedback-per').each(function (i, row)
            {
                  var pollscore = row.innerHTML.replace("&nbsp;", "").replace("%", "")
                  console.log(pollscore)
                scoreArray.push(pollscore)
                //shuffleArray(scoreArray);
            })

            console.log()
*/
          });
        }

        } else {
          msg.channel.send("**Choose from the following polls**\n" +
          "`a! bbp 1` : \"What's Your Favorite Boy Band of All Time?\"\n" + 
          "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" +
          "**Command: `a! bbp <poll-number> <how-many-top-results>`**")
        }

      }

    }}
 //commands end bracket
},

client.login(token));