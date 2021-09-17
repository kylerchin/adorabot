import { cassandraclient } from "./cassandraclient";
import * as youtubei from "youtubei";
import { addVideoToTrackList } from "./../youtubeviewcountdaemon";
const youtube = new youtubei.Client();
import * as Discord from 'discord.js'

// Import MessageEmbed from discord.js
import { Message, MessageEmbed,Util } from "discord.js"
// Import the discord-pages package
const DiscordPages = require("discord-pages");

const query = "SELECT * FROM adorastats.trackedytvideosids"

export function spitoutlist(message) {
    message.reply("Getting list, this might take a while...")
    const embed1 = new MessageEmbed()

    var arrayOfVideos = []

    cassandraclient.execute(query).then((result) => {
        result.rows.forEach(async (row) => {
           // const video = await youtube.getVideo(row.videoid);

                var stringToAdd = `\`${row.videoid}\`| ${row.videoname}`
    
                console.log(stringToAdd)
            arrayOfVideos.push(stringToAdd)

           // addVideoToTrackList(row.videoid,video.title)
    
           // console.log("added " + video.title)
        })
       
        var arrayOfSplitStrings = Util.splitMessage(arrayOfVideos.join(`\n`))

        var arrayOfPages = arrayOfSplitStrings.map((string,n) => {return new Discord.MessageEmbed({"description": string,
        "footer": {
            "text": `Page ${n+1}/${arrayOfSplitStrings.length}`
        }
    })})

       // console.log(arrayOfPages)


    var pageCounter = 0;
    message.channel.send({
      "content": `List Of Videos`,
      embeds: [arrayOfPages[pageCounter]]}).then(messageListEmbed => {

      //  message.channel.stopTyping();

        console.log("finished part 1")
    

            console.log("finished part 1")

          // Filters
          const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id
          const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id
          const deleteFilter = (reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id

          const timeOfTimer = 60*60*1000
          const backwards = messageListEmbed.createReactionCollector({filter: backwardsFilter, time: timeOfTimer})
          const forwards = messageListEmbed.createReactionCollector({filter: forwardsFilter, time: timeOfTimer})
          const deleteCollector = messageListEmbed.createReactionCollector({filter: deleteFilter, time: timeOfTimer})

          backwards.on('collect', (r, u) => {
              if (pageCounter === 0) {
                pageCounter = arrayOfPages.length-1
              } else {
                pageCounter--
              }
              messageListEmbed.edit({embeds: [arrayOfPages[pageCounter]]})
              r.users.remove(r.users.cache.filter(u => u === message.author).first())
          })

          forwards.on('collect', (r, u) => {
              if (pageCounter === arrayOfPages.length-1) {
                pageCounter = 0;
              } else {
                pageCounter++
              }
              messageListEmbed.edit({embeds: [arrayOfPages[pageCounter]]})
              r.users.remove(r.users.cache.filter(u => u === message.author).first())
          })

          deleteCollector.on('collect', (r, u) => {
            messageListEmbed.delete()
          })
          
          messageListEmbed.react('⬅').then( r => {
            messageListEmbed.react('➡').then( r => {
              messageListEmbed.react("🗑")
            })
          })

      })

    })
}

export function removeVideoId(idToRemove,message) {
    const deleteRowQuery = "DELETE FROM adorastats.trackedytvideosids WHERE videoid=? IF EXISTS;"
    const deleteRowParam = [idToRemove]

    cassandraclient.execute(deleteRowQuery,deleteRowParam).then(async (result) => {
        message.reply(`${idToRemove} removed from tracked videos`)
    })
}