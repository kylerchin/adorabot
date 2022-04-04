const requestjson = require('request-json');
import { storeYoutubeDataIntoDatabase } from "./storeYtStats"; 
import {logger, tracer} from "./../logger"
import { dogstatsd } from "./../dogstats";
import {ytChart} from './ytChartMaker'
const ytScraper = require("yt-scraper")
import * as Discord from "discord.js"
import {addStatsToYtVideo, addVideoToTrackList} from './../../youtubeviewcountdaemon'
import { Util } from "discord.js";
const editJsonFile = require("edit-json-file");
const { MessageAttachment } = require('discord.js');
//import {Embed} from "discord.js"
var importconfigfile = editJsonFile(`${__dirname}/../../../removedytvids.json`);
const axios = require('axios').default;

import {replyorfollowup} from './../replyorfollowup'
// Exporting the class which will be 
// used in another file 
// Export keyword or form should be 
// used to use the class
  
    // Class method which prints the 
    // user called in another file 
export async function sendYtCountsEmbed(id,message:Discord.Message|Discord.CommandInteraction,apikey) { 
  tracer.trace('ytEmbedMaker', () => {
  try {

        const pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,status,liveStreamingDetails&id=" + id + "&key=" + apikey

        var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');
      
        youtubeclient.get(pathForYtRequest, async function(err, res, body) {

          const timeOfRequest = new Date();

          //console.log(body)

          //console.log("body.items")
          //console.log(body.items)
          logger.discordDebugLogger.debug({
            type: "ytclientvideorequest", 
            body: body,
            message: "Retrevied Youtube Video Information"
          })


          if (body.items[0]) {
            const videostats = body.items[0].statistics;

            const channelIdOfVideo = body.items[0].snippet.channelId
  
            const pathForChannelOfVideoRequest = "https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2Cstatistics%2Cstatus%2CtopicDetails&id=" + channelIdOfVideo + "&key=" + apikey
  
            console.log('promise start')
  
            var promiseresults:any = await Promise.allSettled([
              axios.get(pathForChannelOfVideoRequest),
              ytChart(body.items[0].id,{
                channelId: body.items[0].snippet.channelId, 
                publishedAt: new Date(body.items[0].snippet.publishedAt),
              addOnPoints: [
                {
                  time:Date.now(),
                  views: videostats.viewCount
                }
              ]})
            ]);
  
            console.log('promise over')
            console.log(promiseresults)
          
            var channelBody = promiseresults[0].value.data
            //console.log(channelBody)
            var imageChartBuffer;
            var successimage = false;
            if (promiseresults[0].status === "fulfilled") {
             imageChartBuffer = promiseresults[1].value;
             successimage = true;
            }
  
            logger.discordInfoLogger.info({
              type: "ytchartreturn",
              videoid: body.items[0].id,
              title: `${body.items[0].snippet.title}`
            })
  
            //console.dir(body)
            logger.discordDebugLogger.debug({
              type: "ytclientchannelrequest", 
              body: channelBody,
              message: "Retrevied Youtube Channel Information"
            })
  
            var discordDate = `<t:${Math.floor(new Date(body.items[0].snippet.publishedAt).getTime()/1000)}:F>`
  
            var imageChartAttachment;
            if (successimage) {
              imageChartAttachment = new Discord.MessageAttachment(imageChartBuffer, 'chart.png')
              // const attachmentChart = new MessageAttachment(imageChartBuffer, 'file.png')
     
              console.log('imagechartattachment', imageChartAttachment)
            }
         
  
            var urlForEmbed = "https://youtube.com/watch?v=" + body.items[0].id
    
              var embedYtStats: Discord.MessageEmbedOptions = 
                {
                  "url": urlForEmbed,
                  "description": `${"*" + Util.escapeMarkdown(channelBody.items[0].snippet.title) + "*\n" + "https://youtu.be/" + body.items[0].id +
                  `${successimage ? '' : '\nChart Image software crashed, couldn\'t generate. Try again?'}`}`,
                  "color": 16711680,
                  "thumbnail": {
                    "url": body.items[0].snippet.thumbnails.default.url
                  },
                  "author": {
                    "name": Util.escapeMarkdown(body.items[0].snippet.title),
                    "url": "https://youtube.com/watch?v=" + body.items[0].id,
                    "iconURL": channelBody.items[0].snippet.thumbnails.default.url
                  },
                  "fields": [
                    {
                      "name": "Views :eyes:",
                      "value": `${parseInt(videostats.viewCount).toLocaleString('en-US')}`,
                      inline: false
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
                      "value": parseInt(videostats.commentCount).toLocaleString('en-US'),
                      inline: false
                    },
                    {
                      "name": "Published at",
                      "value":`${discordDate}`,
                      inline: false
                    }
                  ]
                };
  
                var contentOfMessageReply:any;
               
  
                if (successimage) {
                  embedYtStats['image'] = {
                    "url": `attachment://${imageChartAttachment.name}`,
                  }
                  contentOfMessageReply = {
                    messageorinteraction: message,
                    content: {embeds: [embedYtStats], files: [imageChartAttachment]}
                    }
                  } else {
                    contentOfMessageReply = {
                      messageorinteraction: message,
                      content: {embeds: [embedYtStats]}
                      }
                  }
              
              await replyorfollowup(
                contentOfMessageReply
                ).then(async (repliedMessage) => {
                await addVideoToTrackList(body.items[0].id,body.items[0].snippet.title)
  
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
                  
                  try {
                    console.error(sendMessageerror)
                    await logger.discordWarnLogger({type: "sendYoutubeEmbedFailed"}, sendMessageerror)
                  } catch (errorBIG) {
                    console.error(errorBIG)
                  }
                  
                }
              )
              
  
              var loadedRemovedData = importconfigfile.get()
  
             // loadedRemovedData = importconfigfile.get()
  
              if (loadedRemovedData.removedvids.indexOf(body.items[0].id) == -1 && 
              loadedRemovedData.removedytchannels.indexOf(channelIdOfVideo) == -1) {
               // addStatsToYtVideo(body.items[0].id,parseInt(videostats.viewCount,10),parseInt(videostats.likeCount,10),parseInt(videostats.dislikeCount,10),parseInt(videostats.commentCount,10))
  
               addStatsToYtVideo({
                videoid: body.items[0].id,
                views: parseInt(videostats.viewCount,10),
                likes: parseInt(videostats.likeCount,10),
                dislikes: parseInt(videostats.dislikeCount,10),
                comments: parseInt(videostats.commentCount,10),
                time: timeOfRequest
            })
              }
  
              //return console.log(body);
              dogstatsd.increment('adorabot.youtube.apivideo')
  
              dogstatsd.increment('adorabot.youtube.apichannel')
          } else {
            replyorfollowup(
              {
                messageorinteraction: message,
                content: "Something went wrong! Try again?"
            }
              )
          }
         
        });
      } 
      catch {
        replyorfollowup(
          {
            messageorinteraction: message,
            content: "Ooops, Youtube crashed... try again?"
        }
          )
      }
    });
    } 