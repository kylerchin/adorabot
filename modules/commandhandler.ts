const Discord = require('discord.js');
import { sendYtCountsEmbed } from "./sendYtEmbed"; 
import { verboseDiscordLog } from "./verboseDiscordLog"; 
const wiktionary = require('wiktionary')
const { listCharts,getChart } = require('billboard-top-100');
const isUrl = require("is-url");
const scrapeyoutube = require('scrape-youtube').default;

const getQueryParam = require('get-query-param')

const editJsonFile = require("edit-json-file");
const yts = require( 'yt-search' )
const requestjson = require('request-json');
const request = require('request');

const jsdom = require('jsdom');
var dom = new jsdom.JSDOM();
var window = dom.window;
var document = window.document;

const https = require('https')

var $ = require('jquery')(window);
console.log('version:', $.fn.jquery)

const translate = require('@vitalets/google-translate-api');

export async function commandHandler(msg,client,config,dogstatsd) {

    if (!(!msg.content.toLowerCase().startsWith(config.prefix) || msg.author.bot)) {
        if (true) {
          console.log("prefix true")
          //log triggerprefix adorabot
          dogstatsd.increment('adorabot.triggerprefix');
          //message legal, proceed kind user.
          //parse out args and command
          const args = msg.content.slice(config.prefix.length).split(' ');
          const command = args.shift().toLowerCase();
          console.log("Command is " + command)
    
          if(command === "ping") {
            // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
            // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
            const pingReturn = await msg.channel.send("Ping?");
            pingReturn.edit(`**펑!** Latency is ${pingReturn.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
          }
    
          if (command === "help") {
            msg.channel.send(
              "**Adora Commands!**\n" +
         //     "`a! bbp`: Billboard Polls, run command for more info about each poll\n" +
              "`a! ping`: Pong! Returns the bot's latency to Discord's servers.\n" + 
              "`a! inviteme`: Invite the bot to all your other servers!\n" +
         //     "`a! bv`: Billboard voting, use command to select poll\n",
              "`a! ytstats <video link / search for a video>`: Realtime view counter for YouTube videos. \n Example: `a! ytstats fake love music video` or `a! ytstats https://www.youtube.com/watch?v=gdZLi9oWNZg`\n" +
              "More coming soon... have an idea/request? Message `Kyler#9100`"
            )
          }
    
          if (command === "translate") {
            msg.channel.send("")
          }
    
          if (command === "inviteme") {
            msg.channel.send("Here's the invite link! It's an honor to help you :) \n https://discord.com/api/oauth2/authorize?client_id=737046643974733845&permissions=8&scope=bot")
          }
    
          if (command === "gaon" || command === "goan") {
            let pages = ['Page one!', 'Second page', 'Third page']
            let page = 1 
    
            const embed = new Discord.MessageEmbed() // Define a new embed
            .setColor(0xffffff) // Set the color
            .setFooter(`Page ${page} of ${pages.length}`)
            .setDescription(pages[page-1])
    
            msg.channel.send({embed}).then(msgGaonEmbed => {
              msgGaonEmbed.react('⬅').then( r => {
                msgGaonEmbed.react('➡')
    
                // Filters
                const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === msg.author.id
                const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === msg.author.id
    
                const backwards = msgGaonEmbed.createReactionCollector(backwardsFilter, {timer: 6000})
                const forwards = msgGaonEmbed.createReactionCollector(forwardsFilter, {timer: 6000})
    
                backwards.on('collect', (r, u) => {
                    if (page === 1) return r.users.remove(r.users.cache.filter(u => u === msg.author).first())
                    page--
                    embed.setDescription(pages[page-1])
                    embed.setFooter(`Page ${page} of ${pages.length}`)
                    msgGaonEmbed.edit(embed)
                    r.users.remove(r.users.cache.filter(u => u === msg.author).first())
                })
    
                forwards.on('collect', (r, u) => {
                    if (page === pages.length) return r.users.remove(r.users.cache.filter(u => u === msg.author).first())
                    page++
                    embed.setDescription(pages[page-1])
                    embed.setFooter(`Page ${page} of ${pages.length}`)
                    msgGaonEmbed.edit(embed)
                    r.users.remove(r.users.cache.filter(u => u === msg.author).first())
                })
              })
            })
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
    
          if (command === "youtubestats" || command === "ytstat" || command === "ytstats") {
    
            const youtubeApiKeyRandomlyChosen = config.youtubeApiKeys[Math.floor(Math.random() * config.youtubeApiKeys.length)];
    
            var videoID = "dQw4w9WgXcQ"
            if (isUrl(args[0])) {
              // Valid url
              if (args[0].includes("youtu.be/")) {
                var precurser = args[0].replace("youtu.be/","www.youtube.com/watch?v=")
              } else {
                var precurser = args[0]
              }
              videoID = getQueryParam('v', precurser)
              sendYtCountsEmbed(videoID,msg,youtubeApiKeyRandomlyChosen)
            } else {
              // Invalid url
              
              console.log("invalid url")
    
              const searchYtString = msg.content.replace("a!","").replace(command,"").trim()
    
              //check if video ID is valid without accessing the youtube API
              var requestToYouTubeOembed = 'https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=' + searchYtString
              await request(requestToYouTubeOembed, async function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log("URL is OK") // Print the google web page.
                videoID = getQueryParam('v', 'https://www.youtube.com/watch?v=' + searchYtString)
                console.log(videoID + " is the videoID")
                sendYtCountsEmbed(videoID,msg,youtubeApiKeyRandomlyChosen)
              }  else {
                //video ID is not valid
    
                // search youtube for term instead
                console.log("searching for:" + searchYtString)
    
                //const r = await yts( searchYtString )
    
                //console.log(r)
    
                await scrapeyoutube.search(searchYtString).then(results => {
                    // Unless you specify a type, it will only return 'video' results
                    videoID = results.videos[0].id
                    console.log(results.videos[0])
                    console.log(videoID);
    
                    sendYtCountsEmbed(videoID,msg,youtubeApiKeyRandomlyChosen)
    
                });
              }
            })
    
              }
    
          }
    
          if(command === 'wiktionary') {
            const wikitionaryQuery = msg.content.replace("a! wiktionary","").trim()
            wiktionary(wikitionaryQuery).then(result => {
              console.log(result)
              const discordResponse = result.html.replace(new RegExp('<(/)?i(\S||\s)*?>',"gm"),"_").replace(new RegExp('<(/)?b(\S||\s)*?>',"gm"),"**").replace(new RegExp("(<([^>]+)>)","gm"),"")
              console.log(discordResponse)
              var discordResponseArray = discordResponse.split("\n");
              console.log(discordResponseArray)
              var previousMessageWiktionaryBlankLine = true
              discordResponseArray.forEach(
                 async function (element) { if (element === "") {
                   if (previousMessageWiktionaryBlankLine === false) {
                    await msg.channel.send("\u2800")
                    previousMessageWiktionaryBlankLine = true
                   }
                  } else {
                    await msg.channel.send(element)
                    previousMessageWiktionaryBlankLine = false
                  }
                }
    
              )
          })
        }
    
          if (msg.content.includes("Guys boy I'm home alone now and I'm free If anyone wants to get my nudes message me for free")) {
            console.log("wtf is this shit")
            verboseDiscordLog("code 1d10t \n" + "content: " + msg.content + "\nmessage.id: " + msg.id + "\nauthor.id:" + msg.author.id, client)
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
    
    console.log(nameArray.length)
    
    console.log(nameArray[1])
  
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
}