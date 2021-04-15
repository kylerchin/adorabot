const Discord = require('discord.js');
import { sendYtCountsEmbed } from "./sendYtEmbed"; 
import { verboseDiscordLog } from "./verboseDiscordLog"; 
import { billboardVote,billboardPollGetValue } from "./billboardPolls"; 
import { editProfile,fetchProfile } from "./userProfile"; 
import { banGuildMember } from "./moderation";
import {geniusLyrics } from "./genius"
import { billboardCharts } from "./billboard"
import {processAllModerationCommands,howManyUsersInBanDatabase} from "./moderation"
import {updateDiscordBotsGG } from "./uploadStatsToBotsGg"
const wiktionary = require('wiktionary')
const isUrl = require("is-url");
const scrapeyoutube = require('scrape-youtube').default;
const fs = require('fs');
const ytdl = require('ytdl-core');

const getQueryParam = require('get-query-param')

const editJsonFile = require("edit-json-file");
const yts = require( 'yt-search' )
const requestjson = require('request-json');
const request = require('request');

const https = require('https')

const translate = require('@vitalets/google-translate-api');
import {logger} from './logger'

export async function commandHandler(msg,client,config,cassandraclient,dogstatsd) {

    if (msg.content.toLowerCase().startsWith(config.prefix) || msg.content.toLowerCase().startsWith("a!")) {
        if (!msg.author.bot) {
          console.log("prefix true")
          //log triggerprefix adorabot
          //message legal, proceed kind user.
          //parse out args and command

          var args;

          if(msg.content.toLowerCase().startsWith(config.prefix)) {
            args = msg.content.slice(config.prefix.length).split(' ');
          } else {
            if(msg.content.toLowerCase().startsWith("a!")) {
              args = msg.content.slice("a!".length).split(' ');
            }
          }

          
          const command = args.shift().toLowerCase();
          console.log("Command is " + command)
    
          if(command === "ping") {
            // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
            // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
            const pingReturn = await msg.channel.send("Ping?");
            pingReturn.edit(
              {
                "embed": {
                  "description": `**펑!** If the Latency is significantly higher than the API Latency, the bot is likely ratelimited in this channel or guild.`,
                  "fields": [
                    {
                      "name": "Shard #",
                      "value": msg.guild.shardID
                    },
                    {
                      "name": "Latency",
                      "value": `\`${pingReturn.createdTimestamp - msg.createdTimestamp}ms\``
                    },
                    {
                      "name": "API WebSocket Latency",
                      "value": `\`${Math.round(client.ws.ping)}ms\``
                    }
                  ]
                }}
              
              ).catch();
          }

          if (command === "info") {
            msg.reply("This command is deprecated, please use `a!botstats`").catch()
          }

          if (command === "updatepresence") {
            await msg.channel.send('updating presence...')
            await client.setPresenceForAdora()
            await client.shard.broadcastEval('this.setPresenceForAdora()')
            await msg.channel.send('done!')
          }

          if (command === 'botstats') {

            //await howManyUsersInBanDatabase(cassandraclient)

            var queryNumberOfSubscribedServers = "SELECT COUNT(*) FROM adoramoderation.guildssubscribedtoautoban WHERE subscribed= ? ALLOW FILTERING;"
            var parametersForSubscribedServers = [true]

            await cassandraclient.execute(queryNumberOfSubscribedServers, parametersForSubscribedServers)
            .then(async returnSubscribedServersCount => {
              var subscribedServerCount = await returnSubscribedServersCount.rows[0].count.low
              console.log(typeof subscribedServerCount + ": " + subscribedServerCount)


              var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
            await cassandraclient.execute(lookuphowmanybannedusersquery)
            .then(async returnBanDatabaseAmount => {
                var numberofrowsindatabase = await returnBanDatabaseAmount.rows[0].count.low
                console.log(typeof numberofrowsindatabase + numberofrowsindatabase)
                //return numberofrowsindatabase;

                const promises = [
                  client.shard.fetchClientValues('guilds.cache.size'),
                  client.shard.broadcastEval('this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)')
             ];
       
              return Promise.all(promises)
                  .then(results => {
                      const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
                      const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);
                      return msg.channel.send(`Server count: ${totalGuilds}\nMember count: ${totalMembers}\nNumber of Shards: ${client.shard.count}\nNumber of Bans in Database: ${numberofrowsindatabase}\nNumber of Servers Subscribed to Autoban: ${subscribedServerCount}`);
                  })
                  .catch(console.error);
            })
            })


                   
                }

          if (command === "bio" || command === "viewbio") {
            fetchProfile(client,msg,args,cassandraclient)
          }

          if (command === "editbio") {
            editProfile(client,msg,args,cassandraclient)
          }
    
          if (command === "help") {
            msg.channel.send("**Adora Commands**").catch(console.error());;
            msg.channel.send({
              "embed": {
                "title": "Help Page 1 of 3 - Music Charts & Statistics",
                "description": "Access live information across music charts and platforms",
                "fields": [
                  {
                    "name": "`a!bbp`",
                    "value": "View statistics for billboard polls, run command for more info"
                  },
                  {
                    "name": "`a!bv`",
                    "value": "Retrieve voting links for billboard polls, run command for a list of polls"
                  },
                  {
                    "name": "`a!ytstats`",
                    "value": "`a!ytstats <video link / search for a video>`: Realtime view counter for YouTube videos. \n Example: `a! ytstats fake love music video` or `a! ytstats https://www.youtube.com/watch?v=gdZLi9oWNZg`"
                  }
                ]
              }
            }).catch(console.error());;
            msg.channel.send({
              "embed": {
                "title": "Help Page 2 of 3 - Moderation",
                "description": "Make protecting your community easier!",
                "fields": [
                  {
                    "name": "`a!autoban`",
                    "value": "Automatically block known-raid accounts from blacklists before they come to your server, run command for more info"
                  },
                  {
                    "name": "`a!ban (mentions/userids) [reason]`",
                    "value": "a!ban can ban as many users via mention or user ids with an optional reason"
                  },
                  {
                    "name": "`a!unban (mentions/userids) [reason]`",
                    "value": "Unban as many users via mention or user ids with an optional reason"
                  },
                  {
                    "name": "`a!wrongfulban`",
                    "value": "Report wrongful bans applied by the Adora system and we'll investigate and unban as quickly as we can."
                  }
                ]
              }
            }).catch(console.error());
            msg.channel.send({
              "embed": {
                "title": "Help Page 3 of 3 - Adora",
                "description": "General tools and access!",
                "fields": [
                  {
                    "name": "`a!ping`",
                    "value": "Pong! Returns the bot's latency to Discord's servers."
                  },
                  {
                    "name": "`a!invite`",
                    "value": "Invite the bot to all your friend's servers! Shows invite link and support server."
                  },
                  {
                    "name": "`a!botstats`",
                    "value": "Shows adora bot statistics"
                  },
                  {
                    "name": "I have an idea for a command or feedback!",
                    "value": "We'd love to hear it! Please join our support server and tell us! Run `a!invite` for the invite link to our Support & Suggestion Adorabot Discord Server"
                  }
                ]
              }
            }).catch(console.error());
          }
    
          if (command === "translate") {
            msg.channel.send("")
          }
    
          if (command === "inviteme" || command === "invite") {
            msg.reply("Here's the invite link! It's an honor to help you :) \n https://discord.bots.gg/bots/737046643974733845\nHere's our support server for announcements and questions! https://discord.gg/Dgvm3kt")
          }
    
          if (command === "billboard") {
            await billboardCharts(msg,command,args)
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
                //console.log("searching for:" + searchYtString)
                logger.discordDebugLogger.debug({type: "searchStringForYouTube", searchYtString: searchYtString})
                //const r = await yts( searchYtString )
    
                //console.log(r)
    
                await scrapeyoutube.search(searchYtString).then(results => {
                    // Unless you specify a type, it will only return 'video' results

                    if (results.videos.length <= 0) {
                      msg.reply("I couldn't find any videos matching that term!")
                    }

                    videoID = results.videos[0].id
                    logger.discordDebugLogger.debug({type: "searchStringForYouTube", firstResult: results.videos[0]})
                    logger.discordDebugLogger.debug({type: "searchStringForYouTubevideoId", videoID: videoID});
    
                    sendYtCountsEmbed(videoID,msg,youtubeApiKeyRandomlyChosen)
    
                });
              //}
            }
    
              
    
          }
    
          if(command === 'wiktionary') {
            const wikitionaryQuery = msg.content.replace("a!wiktionary","").replace("a! wiktionary","").trim()
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
    
          if(command === "bbp") {
            
            billboardPollGetValue(msg,args)
    
          }

          if (command === "tomato") {// Join the same voice channel of the author of the message
            try {
              msg.reply("🍅  TOMATO! 🍅")
              if (msg.member.voice.channel) {
                const connection = await msg.member.voice.channel.join();

                                // Create a dispatcher
                const dispatcher = connection.play('tomato.mp3');

                dispatcher.on('start', () => {
                  console.log('tomato.mp3 is now playing!');
                });

                dispatcher.on('finish', () => {
                  console.log('tomato.mp3 has finished playing!');
                });

                // Always remember to handle errors appropriately!
                dispatcher.on('error', console.error);
            }
            } catch {
              console.log("ooops")
            }
          }

          processAllModerationCommands(msg,command,args,config,cassandraclient,client)

          if (command === "genius" || command === "lyric" || command === "lyrics") {
            try {
              geniusLyrics(msg,args,config)
            }
            catch (geniusLyricsCommandError) {
              console.log(geniusLyricsCommandError)
            }
           
          }
    
          await dogstatsd.increment('adorabot.triggerprefix');
    
          await updateDiscordBotsGG(client,config)

          await logger.discordInfoLogger.info({type: "commandToAdora", Command: msg.content, msgObject: msg, msgObjectAuthorTag: msg.author.tag})

        }}
}
