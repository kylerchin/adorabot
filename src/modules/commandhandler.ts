const Discord = require('discord.js');
//import * as Discord from 'discord.js'
import { verboseDiscordLog } from "./verboseDiscordLog";
import { billboardVote, billboardPollGetValue } from "./billboardPolls";
import { editProfile, fetchProfile } from "./userProfile";
import { banGuildMember } from "./moderation";
import { geniusLyrics } from "./genius"
import { billboardCharts } from "./billboard"
import { processAllModerationCommands, howManyUsersInBanDatabase } from "./moderation"
import { updateDiscordBotsGG, updateDatadogCount } from "./uploadStatsToBotsGg"
import {youtubeVideoStats} from "./youtube"
import {sendVoteLinks,showTopVoters} from "./vote"
import {helpDirectory} from "./help"
const wiktionary = require('wiktionary')
const isUrl = require("is-url");
const scrapeyoutube = require('scrape-youtube').default;
const fs = require('fs');
const ytdl = require('ytdl-core');

const getQueryParam = require('get-query-param')

const editJsonFile = require("edit-json-file");
const yts = require('yt-search')
const requestjson = require('request-json');
const request = require('request');
const https = require('https')

const translate = require('@vitalets/google-translate-api');
import { logger,tracer,span } from './logger'
import { ping } from "./ping";

export async function commandHandler(msg, client, config, cassandraclient, dogstatsd) {

  const isDM: boolean = msg.guild === null;

  if (msg.content.toLowerCase().startsWith(config.prefix) || msg.content.toLowerCase().startsWith("a!")) {
    if (!msg.author.bot) {
      console.log("prefix true")
      //log triggerprefix adorabot
      //message legal, proceed kind user.
      //parse out args and command

      var args;

      if (msg.content.toLowerCase().startsWith(config.prefix)) {
        args = msg.content.slice(config.prefix.length).split(' ');
      } else {
        if (msg.content.toLowerCase().startsWith("a!")) {
          args = msg.content.slice("a!".length).split(' ');
        }
      }


      const command = args.shift().toLowerCase();
      console.log("Command is " + command)

      if (command === "ping") {
       await ping(msg,client);
      }

      if (command === "info") {
        msg.reply("This command is deprecated, please use `a!botstats`").catch()
      }

      if (command === "updatepresence") {
        await msg.channel.send('updating presence...')
        await client.setPresenceForAdora()
        await client.shard.broadcastEval(client => client.setPresenceForAdora())
        await msg.channel.send('done!')
      }

      if (command === 'botstats') {

        //await howManyUsersInBanDatabase(cassandraclient)

        var queryNumberOfSubscribedServers = "SELECT COUNT(*) FROM adoramoderation.guildssubscribedtoautoban WHERE subscribed= ? ALLOW FILTERING;"
        var parametersForSubscribedServers = [true]
        var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
        //return numberofrowsindatabase;

        const promises = [
          client.shard.fetchClientValues('guilds.cache.size'),
          client.shard.broadcastEval(client => client.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)),
          cassandraclient.execute(queryNumberOfSubscribedServers, parametersForSubscribedServers),
          cassandraclient.execute(lookuphowmanybannedusersquery)
        ];

        return Promise.all(promises)
          .then(results => {
            const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
            const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);
            var returnSubscribedServersCount = results[2]
            var subscribedServerCount = returnSubscribedServersCount.rows[0].count.low
            var returnBanDatabaseAmount = results[3]
            var numberofrowsindatabase = returnBanDatabaseAmount.rows[0].count.low
            return msg.channel.send(`Server count: ${totalGuilds}\nMember count: ${totalMembers}\nNumber of Shards: ${client.shard.count}\nNumber of Bans in Database: ${numberofrowsindatabase}\nNumber of Servers Subscribed to Autoban: ${subscribedServerCount}`);
          })
          .catch(console.error);





      }

      if (command === "bio" || command === "viewbio") {
        fetchProfile(client, msg, args, cassandraclient)
      }

      if (command === "datadog") {
        updateDatadogCount(client,config,cassandraclient)
      }

      if (command === "vote") {
        sendVoteLinks(msg)
      }

      if (command === "votes") {
        showTopVoters({cassandraclient,message: msg,client})
      }

      if (command === "editbio") {
        editProfile(client, msg, args, cassandraclient)
      }

      if (command === "help") {
        helpDirectory({message: msg,
          command,args})
      }

      if (command === "translate") {
        msg.channel.send("")
      }

      if (command === "inviteme" || command === "invite" || command === "inviter") {
        msg.reply("Here's the invite link! It's an honor to help you :) \n https://discord.com/api/oauth2/authorize?client_id=737046643974733845&permissions=8&scope=bot\nHere's our support server for announcements and questions! Subscribe to the announcements channel for updates. https://discord.gg/3h6dpyzHk7\nRemember to run `a!help` for the list of commands!")
      }

      if (command === "billboard") {
        await billboardCharts(msg, command, args,client)
      }

      if (command === "gaon" || command === "goan") {
        let pages = ['Page one!', 'Second page', 'Third page']
        let page = 1

        const embed = new Discord.MessageEmbed() // Define a new embed
          .setColor(0xffffff) // Set the color
          .setFooter(`Page ${page} of ${pages.length}`)
          .setDescription(pages[page - 1])

        msg.channel.send({ embeds: [embed] }).then(msgGaonEmbed => {
          msgGaonEmbed.react('⬅').then(r => {
            msgGaonEmbed.react('➡')

            // Filters
            const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === msg.author.id
            const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === msg.author.id

            const backwards = msgGaonEmbed.createReactionCollector(backwardsFilter, { timer: 6000 })
            const forwards = msgGaonEmbed.createReactionCollector(forwardsFilter, { timer: 6000 })

            backwards.on('collect', (r, u) => {
              if (page === 1) return r.users.remove(r.users.cache.filter(u => u === msg.author).first())
              page--
              embed.setDescription(pages[page - 1])
              embed.setFooter(`Page ${page} of ${pages.length}`)
              msgGaonEmbed.edit(embed)
              r.users.remove(r.users.cache.filter(u => u === msg.author).first())
            })

            forwards.on('collect', (r, u) => {
              if (page === pages.length) return r.users.remove(r.users.cache.filter(u => u === msg.author).first())
              page++
              embed.setDescription(pages[page - 1])
              embed.setFooter(`Page ${page} of ${pages.length}`)
              msgGaonEmbed.edit(embed)
              r.users.remove(r.users.cache.filter(u => u === msg.author).first())
            })
          })
        })
      }

      if (command === "bv") {

        billboardVote(msg, args)

      }

      if (command === "youtubestats" || command === "ytstat" || command === "ytstats" || command === "youtube" || command === "yt") {

        await youtubeVideoStats(msg,command,client,config,args)



      }

      if (command === 'wiktionary') {
        const wikitionaryQuery = msg.content.replace("a!wiktionary", "").replace("a! wiktionary", "").trim()
        wiktionary(wikitionaryQuery).then(result => {
          console.log(result)
          const discordResponse = result.html.replace(new RegExp('<(/)?i(\S||\s)*?>', "gm"), "_").replace(new RegExp('<(/)?b(\S||\s)*?>', "gm"), "**").replace(new RegExp("(<([^>]+)>)", "gm"), "")
          console.log(discordResponse)
          var discordResponseArray = discordResponse.split("\n");
          console.log(discordResponseArray)
          var previousMessageWiktionaryBlankLine = true
          discordResponseArray.forEach(
            async function (element) {
              if (element === "") {
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

      if (command === "bbp") {

        billboardPollGetValue(msg, args)

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

      processAllModerationCommands(msg, command, args, config, cassandraclient, client)

      if (command === "genius" || command === "lyric" || command === "lyrics") {
        try {
          geniusLyrics(msg, args, config)
        }
        catch (geniusLyricsCommandError) {
          console.log(geniusLyricsCommandError)
        }

      }

      await dogstatsd.increment('adorabot.triggerprefix');

      await updateDiscordBotsGG(client, config)

     // const isDM: boolean = msg.guild === null;

      var commandToAdoraInfo 

      if (msg.guild.available && isDM === false) {
        commandToAdoraInfo = {
          type: "commandToAdora", Command: msg.content, msgObject: msg, msgObjectAuthorTag: msg.author.tag, guildID : msg.guild.id, guildName : msg.guild.name
        }
      } else {
        commandToAdoraInfo = {
          type: "commandToAdora", Command: msg.content, msgObject: msg, msgObjectAuthorTag: msg.author.tag
        }
      }

      const loggedCommand = await logger.discordInfoLogger.info(commandToAdoraInfo)
      tracer.inject(span, 'log', loggedCommand)

    }
  }
}


