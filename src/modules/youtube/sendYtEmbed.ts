const requestjson = require('request-json');
import { storeYoutubeDataIntoDatabase } from "./storeYtStats";
import { logger, tracer } from "./../logger"
import { dogstatsd } from "./../dogstats";
import { ytChart } from './ytChartMaker'
const ytScraper = require("yt-scraper")
import * as Discord from "discord.js"
import { interactionSentYetCache } from "./cacheInteractionSentYet";
import { addStatsToYtVideo, addVideoToTrackList } from './../../youtubeviewcountdaemon'
import { Util } from "discord.js";
const editJsonFile = require("edit-json-file");
const { MessageAttachment } = require('discord.js');
//import {Embed} from "discord.js"
var importconfigfile = editJsonFile(`${__dirname}/../../../removedytvids.json`);
const axios = require('axios').default;
import { lookuplocale } from './../lookuptablelocale'
import { replyorfollowup } from './../replyorfollowup'
import { Worker } from 'worker_threads'

import * as path from 'path';
import { uploadStringToNewRelic } from "./../newRelic";
// Exporting the class which will be 
// used in another file 
// Export keyword or form should be 
// used to use the class

// Class method which prints the 
// user called in another file 

interface sendYtCountsEmbedOptions {
  videoid: string;
  message: Discord.Message | Discord.CommandInteraction;
  apikey: string;
  type: string;
}

export async function sendYtCountsEmbed(options: sendYtCountsEmbedOptions) {

  try {

  } catch (err) {
    console.log(err);


  }
  const { videoid, message, apikey, type } = options;

  tracer.trace('ytEmbedMaker', () => {
    try {

      const pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,status,liveStreamingDetails&id=" + videoid + "&key=" + apikey

      var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');

      youtubeclient.get(pathForYtRequest, async function (err, res, body) {

        const timeOfRequest = new Date();

        //console.log(body)

        //console.log("body.items")
        //console.log(body.items)
        logger.discordDebugLogger.debug({
          type: "ytclientvideorequest",
          body: body,
          message: "Retrevied Youtube Video Information"
        });

        if (!err) {
          if (body.items) {
            if (body.items[0]) {
              const videostats = body.items[0].statistics;

              const channelIdOfVideo = body.items[0].snippet.channelId

              const pathForChannelOfVideoRequest = "https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2Cstatistics%2Cstatus%2CtopicDetails&id=" + channelIdOfVideo + "&key=" + apikey

              console.log('promise start')

              var promiseresults: any = await Promise.allSettled([
                axios.get(pathForChannelOfVideoRequest),
                ytChart(body.items[0].id, {
                  channelId: body.items[0].snippet.channelId,
                  locale: message.locale,
                  subtitle: body.items[0].snippet.title,
                  publishedAt: new Date(body.items[0].snippet.publishedAt),
                  addOnPoints: [
                    {
                      time: Date.now(),
                      views: videostats.viewCount
                    }
                  ]
                })
              ]);

              try {
                await Promise.all([
                  new Promise((resolve, reject) => {
                    const worker = new Worker(
                      path.resolve(__dirname, './ytWorkerWrapper.js')
                      , {
                        workerData: {
                          id: body.items[0].id,
                          optionsObject: {
                            channelId: body.items[0].snippet.channelId,
                            locale: message.locale,
                            subtitle: body.items[0].snippet.title,
                            publishedAt: new Date(body.items[0].snippet.publishedAt),
                            addOnPoints: [
                              {
                                time: Date.now(),
                                views: videostats.viewCount
                              }
                            ]
                          }

                        }
                      });
                    worker.on('message', resolve);
                    worker.on('error', reject);
                  })
                ])
              } catch (err) {
                console.error(err)
              }

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

              var discordDate = `<t:${Math.floor(new Date(body.items[0].snippet.publishedAt).getTime() / 1000)}:F>`

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
                    "name": `${lookuplocale({
                      key: "views",
                      locale: message.locale
                    })} :eyes:`,
                    "value": `${parseInt(videostats.viewCount).toLocaleString('en-US')}`,
                    inline: true
                  },
                  {
                    "name": `${lookuplocale({
                      key: "likes",
                      locale: message.locale
                    })} :thumbsup:`,
                    "value": parseInt(videostats.likeCount).toLocaleString('en-US'),
                    "inline": true
                  },
                  /*
                  {
                    "name": `${lookuplocale({
                      key: "dislikes",
                      locale: message.locale
                    })} :thumbsdown:`,
                    "value": parseInt(videostats.dislikeCount).toLocaleString( 'en-US'),
                    "inline": true
                  },*/
                  {
                    "name": `${lookuplocale({
                      key: "comments",
                      locale: message.locale
                    })} :speech_balloon:`,
                    "value": parseInt(videostats.commentCount).toLocaleString('en-US'),
                    inline: true
                  },
                  {
                    "name": `${lookuplocale({
                      key: "publishedat",
                      locale: message.locale
                    })
                      }`,
                    "value": `${discordDate}`,
                    inline: false
                  }
                ]
              };

              var contentOfMessageReply: any;


              if (successimage) {
                embedYtStats['image'] = {
                  "url": `attachment://${imageChartAttachment.name}`,
                }
                contentOfMessageReply = {
                  messageorinteraction: message,
                  content: { embeds: [embedYtStats], files: [imageChartAttachment] }
                }
              } else {
                contentOfMessageReply = {
                  messageorinteraction: message,
                  content: { embeds: [embedYtStats] }
                }
              }

              var keepsending: boolean = true;

              if (type === "interaction") {
                if (message.replied === true) {
                  keepsending = false;
                }
              }

              if (interactionSentYetCache.get(message.id) != undefined) {

                keepsending = false;

              }

              if (keepsending) {

                interactionSentYetCache.set(message.id, true)

                await replyorfollowup(
                  contentOfMessageReply
                ).then(async (repliedMessage) => {
                  await addVideoToTrackList(body.items[0].id, body.items[0].snippet.title)

                  var loggerBody = {
                    type: "adoraResponse", "typeOfCommand": "youTubeStats", repliedMessage: repliedMessage,
                    titleOfVideo: body.items[0].snippet.title
                  }

                  if (repliedMessage.guild) {
                    loggerBody["guildName"] = repliedMessage.guild.name,
                      loggerBody["guildId"] = repliedMessage.guild.id
                  }

                  await logger.discordInfoLogger.info(loggerBody)
                }).catch(
                  async (sendMessageerror) => {

                    try {
                      console.error(sendMessageerror)
                      await logger.discordWarnLogger({ type: "sendYoutubeEmbedFailed" }, sendMessageerror)
                    } catch (errorBIG) {
                      console.error(errorBIG)
                    }

                  }
                )
              }




              var loadedRemovedData = importconfigfile.get()

              // loadedRemovedData = importconfigfile.get()

              if (loadedRemovedData.removedvids.indexOf(body.items[0].id) == -1 &&
                loadedRemovedData.removedytchannels.indexOf(channelIdOfVideo) == -1) {
                // addStatsToYtVideo(body.items[0].id,parseInt(videostats.viewCount,10),parseInt(videostats.likeCount,10),parseInt(videostats.dislikeCount,10),parseInt(videostats.commentCount,10))

                addStatsToYtVideo({
                  videoid: body.items[0].id,
                  views: parseInt(videostats.viewCount, 10),
                  likes: parseInt(videostats.likeCount, 10),
                  dislikes: parseInt(videostats.dislikeCount, 10),
                  comments: parseInt(videostats.commentCount, 10),
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
          } else {
            replyorfollowup(
              {
                messageorinteraction: message,
                content: "Something went wrong! Try again?\nError: `No items sent back from YouTube API for video id " + videoid + "`"
              }
            )

            if (message.channel) {
              message.channel.send("```json\n" + JSON.stringify(body, null, 2) + "```").catch((error) => {
                console.log(error)
              })

              if (message.channel.id === "827670630580355083") {
                message.channel.send("API KEY: `" + apikey + "`");
              }
            }

          }

        } else {
          console.error(err);

          replyorfollowup(
            {
              messageorinteraction: message,
              content: "Adora got your request for video id `" + videoid + "` but YouTube ditched Adora's request for stats. Try again?\n"
            }
          )

          uploadStringToNewRelic(JSON.stringify({
            type: "youtubeBotFetchFail",
            videoid: videoid,
            apikey,
            err
          }))
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