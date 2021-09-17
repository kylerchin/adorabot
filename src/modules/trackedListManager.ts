import { cassandraclient } from "./cassandraclient";
import * as youtubei from "youtubei";
import { addVideoToTrackList } from "./../youtubeviewcountdaemon";
const youtube = new youtubei.Client();

// Import MessageEmbed from discord.js
import { Message, MessageEmbed,Util } from "discord.js"
// Import the discord-pages package
const DiscordPages = require("discord-pages");

const query = "SELECT * FROM adorastats.trackedytvideosids"

export function spitoutlist(message) {
    message.reply("Getting list, this might take a while...")
    const embed1 = new MessageEmbed()

    var arrayOfVideos = []

    cassandraclient.execute(query).then(async (result) => {
        result.rows.forEach(async (row) => {
            const video = await youtube.getVideo(row.videoid);
    
            arrayOfVideos.push(`\`${row.videoid}\`| ${video.title}`)

           // addVideoToTrackList(row.videoid,video.title)
    
           // console.log("added " + video.title)
        })
       
        var arrayOfPages = Util.splitMessage(arrayOfVideos.join(`\n`))

                // Create a new embed page
        // Pages param is an array of embeds
        // Channel param is the TextChannel that you want to send the embed pages
        const embedPages = new DiscordPages({ 
            pages: arrayOfPages, 
            channel: message.channel, 
        });
        embedPages.createPages();

    })
}

export function removeVideoId(idToRemove,message) {
    const deleteRowQuery = "DELETE FROM adorastats.trackedytvideosids WHERE videoid=? IF EXISTS;"
    const deleteRowParam = [idToRemove]

    cassandraclient.execute(deleteRowQuery,deleteRowParam).then(async (result) => {
        message.reply(`${idToRemove} removed from tracked videos`)
    })
}