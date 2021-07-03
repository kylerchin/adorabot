const requestjson = require('request-json');
import { storeYoutubeDataIntoDatabase } from "./storeYtStats"; 
import {logger} from "./logger"
const ytScraper = require("yt-scraper")
import * as Discord from "discord.js"
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

          var urlForEmbed = "https://youtube.com/watch?v=" + body.items[0].id
  
            const embedYtStats:Discord.MessageEmbedOptions = 
              {
                "url": urlForEmbed,
                "description": "*" + channelBody.items[0].snippet.title + "*\n" + "https://youtu.be/" + body.items[0].id,
                "color": 16711680,
                "timestamp": Date.now(),
                "footer": {
                  "text": "Drink water uwu <3 #JusticeForGeorgeFloyd #BlackLivesMatter"
                },
                "thumbnail": {
                  "url": body.items[0].snippet.thumbnails.default.url
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
            
  
            await message.reply({embeds: [embedYtStats]}).then(async (repliedMessage) => {
              if(repliedMessage.guild.available) {
                await logger.discordInfoLogger.info({type: "adoraResponse", "typeOfCommand": "youTubeStats", repliedMessage: repliedMessage, guildName: repliedMessage.guild.name, guildAnailable: repliedMessage.guild.available})
              }
              else {
                await logger.discordInfoLogger.info({type: "adoraResponse", "typeOfCommand": "youTubeStats", repliedMessage: repliedMessage, guildAvailable: repliedMessage.guild.available})
              }
            }).catch(
              async (sendMessageerror) => {
                await logger.discordWarnLogger({type: "sendYoutubeEmbedFailed"}, sendMessageerror)
              }
            )
            
            

            //return console.log(body);
  
          });
        });
      } 
      catch {
        message.reply("Ooops, Youtube crashed... try again?")
      }

    } 