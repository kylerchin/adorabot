const requestjson = require('request-json');
import { storeYoutubeDataIntoDatabase } from "./storeYtStats"; 
import {logger} from "./logger"
import {ytChart} from './ytChartMaker'
const ytScraper = require("yt-scraper")
import * as Discord from "discord.js"
import {addStatsToYtVideo, addVideoToTrackList} from './../youtubeviewcountdaemon'
const editJsonFile = require("edit-json-file");
const { MessageAttachment } = require('discord.js')
var importconfigfile = editJsonFile(`${__dirname}/../../removedytvids.json`);
// Exporting the class which will be 
// used in another file 
// Export keyword or form should be 
// used to use the class  
  
    // Class method which prints the 
    // user called in another file 
export async function sendYtCountsEmbed(id,message:Discord.Message,apikey) { 

  try {

        const pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,status,liveStreamingDetails&id=" + id + "&key=" + apikey

        var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');
      
        youtubeclient.get(pathForYtRequest, async function(err, res, body) {

          //console.log(body)

          //console.log("body.items")
          //console.log(body.items)

          await logger.discordDebugLogger.debug({
            type: "ytclientvideorequest", 
            body: body,
            message: "Retrevied Youtube Video Information"
          })

          const channelIdOfVideo = body.items[0].snippet.channelId

          const pathForChannelOfVideoRequest = "https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2Cstatistics%2Cstatus%2CtopicDetails&id=" + channelIdOfVideo + "&key=" + apikey

        await  youtubeclient.get(pathForChannelOfVideoRequest, async function(channelErr, channelRes, channelBody) {

          //console.dir(body)
          await logger.discordDebugLogger.debug({
            type: "ytclientchannelrequest", 
            body: channelBody,
            message: "Retrevied Youtube Channel Information"
          })

          const videostats = body.items[0].statistics;

         var imageChartBuffer = await ytChart(body.items[0].id)
         var imageChartAttachment = new Discord.MessageAttachment(imageChartBuffer, 'chart.png')
         // const attachmentChart = new MessageAttachment(imageChartBuffer, 'file.png')

          var urlForEmbed = "https://youtube.com/watch?v=" + body.items[0].id
  
            const embedYtStats:Discord.MessageEmbedOptions = 
              {
                "url": urlForEmbed,
                "description": "*" + channelBody.items[0].snippet.title + "*\n" + "https://youtu.be/" + body.items[0].id,
                "color": 16711680,
                "thumbnail": {
                  "url": body.items[0].snippet.thumbnails.default.url
                },
                "image": {
                  "url": `attachment://${imageChartAttachment.name}`,
                },
                "author": {
                  "name": body.items[0].snippet.title,
                  "url": "https://youtube.com/watch?v=" + body.items[0].id,
                  "icon_url": channelBody.items[0].snippet.thumbnails.default.url
                },
                "fields": [
                  {
                    "name": "Views :eyes:",
                    "value": parseInt(videostats.viewCount).toLocaleString('en-US')
                  },
                  {
                    "name": "Likes :thumbsup:",
                    "value": parseInt(videostats.likeCount).toLocaleString('en-US'),
                    "inline": true
                  },
                  {
                    "name": "Dislikes :thumbsdown:",
                    "value": parseInt(videostats.dislikeCount).toLocaleString('en-US'),
                    "inline": true
                  },
                  {
                    "name": "Comments :speech_balloon:",
                    "value": parseInt(videostats.commentCount).toLocaleString('en-US')
                  }
                ]
              }
            
  
            await message.reply({embeds: [embedYtStats], files: [imageChartAttachment]}).then(async (repliedMessage) => {
              await addVideoToTrackList(body.items[0].id)

              var loggerBody = {type: "adoraResponse", "typeOfCommand": "youTubeStats", repliedMessage: repliedMessage, 
              titleOfVideo: body.items[0].snippet.title
            }
              

              if(repliedMessage.guild) {
                loggerBody["guildName"] = repliedMessage.guild.name,
                loggerBody["guildId"] = repliedMessage.guild.id
              }

              await logger.discordInfoLogger.info(loggerBody)
            }).catch(
              async (sendMessageerror) => {
                await logger.discordWarnLogger({type: "sendYoutubeEmbedFailed"}, sendMessageerror)
              }
            )
            

            var loadedRemovedData = importconfigfile.get()

            loadedRemovedData = importconfigfile.get()

            if (loadedRemovedData.removedvids.indexOf(body.items[0].id) == -1 && 
            loadedRemovedData.removedytchannels.indexOf(channelIdOfVideo) == -1) {
              addStatsToYtVideo(body.items[0].id,parseInt(videostats.viewCount,10),parseInt(videostats.likeCount,10),parseInt(videostats.dislikeCount,10),parseInt(videostats.commentCount,10))
            }

            //return console.log(body);
  
          });
        });
      } 
      catch {
        message.reply("Ooops, Youtube crashed... try again?")
      }

    } 