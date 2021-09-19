import { cassandraclient } from "./cassandraclient";
import * as youtubei from "youtubei";
import { addVideoToTrackList } from "./../youtubeviewcountdaemon";
const youtube = new youtubei.Client();
import * as Discord from 'discord.js'
const TimeUuid = require('cassandra-driver').types.TimeUuid;

// Import MessageEmbed from discord.js
import { Message, MessageEmbed,Util } from "discord.js"
import { sendPages } from "./pages";
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

                var stringToAdd = `\`${row.videoid}\`| ${Util.escapeMarkdown(row.videoname)}`
    
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
       sendPages(message.channel,arrayOfPages,message,"Guilds")

    })
}

export function removeVideoId(idToRemove,message) {
    const deleteRowQuery = "DELETE FROM adorastats.trackedytvideosids WHERE videoid=? IF EXISTS;"
    const deleteRowParam = [idToRemove]

    cassandraclient.execute(deleteRowQuery,deleteRowParam).then(async (result) => {
        message.reply(`${idToRemove} removed from tracked videos`)
    })
}
export function removeAllPoints(idToRemove,message) {
  var rowsRemoved = 0

  var listOfQueries = []

  const deleteRowQuery = "DELETE FROM adorastats.ytvideostats WHERE videoid=? and time = ? IF EXISTS;"
  

  cassandraclient.stream('SELECT * FROM adorastats.ytvideostats WHERE videoid=?', [ idToRemove ])
  .on('readable', function () {
    // 'readable' is emitted as soon a row is received and parsed
    var row;
    while (row = this.read()) {
      rowsRemoved += 1;

      listOfQueries.push({
        query: deleteRowQuery,
        params: [idToRemove,row.time]
      })
    }
  })
  .on('end', function () {
    cassandraclient.batch(listOfQueries, { prepare: true }).catch(error => console.log(error));
   // console.log('Data updated on cluster');
    // Stream ended, there aren't any more rows
    message.reply(`${idToRemove} removed from tracked videos, removed ${listOfQueries.length} rows`)
  })
  .on('error', function (err) {
    // Something went wrong: err is a response error from Cassandra
  });
}