const Discord = require('discord.js');
import { sendYtCountsEmbed } from "./sendYtEmbed"; 
import { verboseDiscordLog } from "./verboseDiscordLog"; 
import { billboardVote,billboardPollGetValue } from "./billboardPolls"; 
import { editProfile,fetchProfile } from "./userProfile"; 
const wiktionary = require('wiktionary')
const { listCharts,getChart } = require('billboard-top-100');
const isUrl = require("is-url");
const scrapeyoutube = require('scrape-youtube').default;

const getQueryParam = require('get-query-param')

const editJsonFile = require("edit-json-file");
const yts = require( 'yt-search' )
const requestjson = require('request-json');
const request = require('request');

const https = require('https')

const translate = require('@vitalets/google-translate-api');

export async function commandHandler(msg,client,config,cassandraclient,dogstatsd) {

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

          if (command === 'stats') {
                   const promises = [
                       client.shard.fetchClientValues('guilds.cache.size'),
                       client.shard.broadcastEval('this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)')
                  ];
            
                   return Promise.all(promises)
                       .then(results => {
                           const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
                           const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);
                           return msg.channel.send(`Server count: ${totalGuilds}\nMember count: ${totalMembers}`);
                       })
                       .catch(console.error);
                }

          if (command === "bio" || command === "viewbio") {
            fetchProfile(client,msg,args,cassandraclient)
          }

          if (command === "editbio") {
            editProfile(client,msg,args,cassandraclient)
          }
    
          if (command === "help") {
            msg.reply(
              "**Adora Commands!**\n" +
             "`a! bbp`: Billboard Polls, run command for more info about each poll\n" +
              "`a! ping`: Pong! Returns the bot's latency to Discord's servers.\n" + 
              "`a! inviteme`: Invite the bot to all your other servers!\n" +
            "`a! bv`: Billboard voting, use command to select poll\n" +
              "`a! ytstats <video link / search for a video>`: Realtime view counter for YouTube videos. \n Example: `a! ytstats fake love music video` or `a! ytstats https://www.youtube.com/watch?v=gdZLi9oWNZg`\n" +
              "More coming soon... have an idea/request? Message `Kyler#9100`"
            )
          }
    
          if (command === "translate") {
            msg.channel.send("")
          }
    
          if (command === "inviteme") {
            msg.reply("Here's the invite link! It's an honor to help you :) \n https://discord.com/api/oauth2/authorize?client_id=737046643974733845&permissions=8&scope=bot")
          }
    
          if (command === "billboard") {

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
    
            billboardVote(msg,args)

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
    
              /*
              //check if video ID is valid without accessing the youtube API
              var requestToYouTubeOembed = 'https://www.youtube.com/watch?v=' + searchYtString
              await request(requestToYouTubeOembed, async function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log("URL is OK") // Print the google web page.
                videoID = getQueryParam('v', 'https://www.youtube.com/watch?v=' + searchYtString)
                console.log(videoID + " is the videoID")
                sendYtCountsEmbed(videoID,msg,youtubeApiKeyRandomlyChosen)
              }  else {*/
                //video ID is not valid
    
                // search youtube for term instead
                console.log("searching for:" + searchYtString)
    
                //const r = await yts( searchYtString )
    
                //console.log(r)
    
                await scrapeyoutube.search(searchYtString).then(results => {
                    // Unless you specify a type, it will only return 'video' results

                    if (results.videos.length <= 0) {
                      msg.reply("I couldn't find any videos matching that term!")
                    }

                    videoID = results.videos[0].id
                    console.log(results.videos[0])
                    console.log(videoID);
    
                    sendYtCountsEmbed(videoID,msg,youtubeApiKeyRandomlyChosen)
    
                });
              //}
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

          if (command === 'fetchvoiceregions') {
            client.fetchVoiceRegions()
              .then(regions => msg.channel.send(`Available regions are: ${regions.map(region => region.name).join(', ')}`))
              .catch(console.error);
          }
    
          if (msg.content.includes("Guys boy I'm home alone now and I'm free If anyone wants to get my nudes message me for free")) {
            console.log("wtf is this shit")
            verboseDiscordLog("code 1d10t \n" + "content: " + msg.content + "\nmessage.id: " + msg.id + "\nauthor.id:" + msg.author.id, client)
          }
    
          if(command === "bbp") {
            
            billboardPollGetValue(msg,args)
    
          }
    
        }}
}