const isUrl = require("is-url");
const scrapeyoutube = require('scrape-youtube').default;
import { sendYtCountsEmbed } from "./sendYtEmbed";
import { logger } from "../logger";
const getQueryParam = require('get-query-param')
import * as youtubei from "youtubei";
import { CommandInteraction } from "discord.js"
const youtube = new youtubei.Client();
const editJsonFile = require("edit-json-file");
var importconfigfile = editJsonFile(`${__dirname}/../../removedytvids.json`);
import { uploadStringToNewRelic } from "./../newRelic";
import { Message,ButtonInteraction } from 'discord.js'
import { interactionSentYetCache } from './cacheInteractionSentYet';

import * as path from 'path';
import { Worker } from 'worker_threads';

function skipChannel(channelid) {
    try {
        var loadedRemovedData = importconfigfile.get()

        if (loadedRemovedData.removedytchannels.indexOf(channelid) == -1
            && loadedRemovedData.skippedytchannels.indexOf(channelid) == -1
        ) {
            return false
        } else {
            return true;
        }
    }
    catch (error) {
        return false;
    }
}

function skipVideo(videoid) {
    try {
        var loadedRemovedData = importconfigfile.get()

        if (loadedRemovedData.skippedvids.indexOf(videoid) == -1
        ) {
            return false
        } else {
            return true;
        }
    }
    catch (error) {
        return false;
    }
}

export async function youtubeHelpMessageReply(message) {
    message.reply("The correct format for Youtube Video Searches is `a!youtube [youtube url / search string]`\n" +
        "A search looks like `a!youtube BTS Dynamite`\n" +
        "Acceptable URLS include\n" +
        "Youtube `a!yt https://youtube.com/watch?v=FFmdTU4Cpr8`\n" +
        "YouTu.be `a!youtube https://youtu.be/FFmdTU4Cpr8`\n" +
        "Youtube Music `a!youtube https://music.youtube.com/watch?v=FFmdTU4Cpr8`\n" +
        "YouTube shorts `a!yt  https://www.youtube.com/shorts/gzhHC1nOrm8`" +
        "\n\nLooking to watch videos together? use `a!ytparty`")
}

//fetch youtube videos

export async function youtubeChannelStats(message: Message, command, client, config, args) {
    // const youtubeApiKeyRandomlyChosen = config.youtubeApiKeys[Math.floor(Math.random() * config.youtubeApiKeys.length)];

    console.log("searching for yt channel")

    const searchYtString = message.content.replace("a!", "").replace(command, "").trim()

    scrapeyoutube.search(searchYtString, { type: 'channel' }).then((results) => {
        //console.log(results.channels[0]);

        if (results.channels.length > 0) {
            var firstChannel = results.channels[0]
            message.reply({
                embeds: [
                    {
                        "thumbnail": {
                            url: firstChannel.thumbnail
                        },
                        "title": firstChannel.name,
                        "description": firstChannel.description.substring(0, 1000),
                        "fields": [
                            {
                                "name": "Video Count",
                                "value": `${firstChannel.videoCount}`
                            },
                            {
                                "name": "Subscribers",
                                "value": `${firstChannel.subscribers}`
                            },
                            {
                                "name": "id",
                                "value": `${firstChannel.id}`
                            }
                        ]
                    }
                ]
            })
        } else {
            message.reply("No channels found with that name! Please modify your search and try again.")
        }


    });


}

function convertUrlToVideoId(ytquery) {
    var precurser = ytquery.trim();

    if (ytquery.match(/youtube.com\/shorts\//g)) {
        console.log('match')
        precurser = ytquery.replace("?feature=share", "").replace(/youtube.com\/shorts\//g, "youtube.com/watch?v=")
    } else {
        // Valid url
        if (ytquery.includes("youtu.be/")) {
            precurser = ytquery.replace("youtu.be/", "www.youtube.com/watch?v=").trim();
        } else {
            precurser = ytquery.trim()
        }
    }
    return getQueryParam('v', precurser);
}


export async function youtubeVideoButtonInteraction(interaction: ButtonInteraction, config:any) {
          // Defer to send an ephemeral reply later
    interaction.deferReply()
    .then(console.log)
    .catch(console.error);

    const youtubeApiKeyRandomlyChosen = config.youtubeApiKeys[Math.floor(Math.random() * config.youtubeApiKeys.length)];

    const customId = interaction.customId;

    const splitInfo = customId.split("|");

    const userid = splitInfo[1];
    const videoid = splitInfo[2];

    if (userid === interaction.user.id) {
        // user is allowed to react to this
        sendYtCountsEmbed({
            videoid,
            message: interaction,
            apikey: youtubeApiKeyRandomlyChosen,
            type: "interaction"
        })
    }
}

export async function youtubeVideoStatsInteraction(interaction: any, config: any) {

    // Defer to send an ephemeral reply later
    interaction.deferReply()
        .then(console.log)
        .catch(console.error);

    const youtubeApiKeyRandomlyChosen = config.youtubeApiKeys[Math.floor(Math.random() * config.youtubeApiKeys.length)];

    var videoID = "dQw4w9WgXcQ"

    var ytquery = interaction.options.getString('search-or-url').trim();

    if (isUrl(ytquery)) {
        videoID = convertUrlToVideoId(ytquery);

        sendYtCountsEmbed({
            videoid: videoID,
            message: interaction,
            apikey: youtubeApiKeyRandomlyChosen,
            type: "interaction"
        });

        setTimeout(() => {
            if (interaction.id) {
                if (interactionSentYetCache.get(interaction.id) === undefined) {
                    sendYtCountsEmbed({
                        videoid: videoID,
                        message: interaction,
                        apikey: youtubeApiKeyRandomlyChosen,
                        type: "interaction"
                    });
                }

            }
        }, 5000);

    } else {
        // Invalid url

        console.log("invalid url")

        const searchYtString = ytquery.trim();

        if (searchYtString.length === 0) {
            await youtubeHelpMessageReply(interaction)
        }
        else {
            /*
       //check if video ID is valid without accessing the youtube API
       var requestToYouTubeOembed = 'https://www.youtube.com/watch?v=' + searchYtString
       await request(requestToYouTubeOembed, async function (error, response, body) {
       if (!error && response.statusCode == 200) {
         console.log("URL is OK") // Print the google web page.
         videoID = getQueryParam('v', 'https://www.youtube.com/watch?v=' + searchYtString)
         console.log(videoID + " is the videoID")
         sendYtCountsEmbed(videoID,message,youtubeApiKeyRandomlyChosen)
       }  else {*/
            //video ID is not valid

            // search youtube for term instead
            //console.log("searching for:" + searchYtString)
            logger.discordDebugLogger.debug({ type: "searchStringForYouTube", searchYtString: searchYtString })
            //const r = await yts( searchYtString )

            //console.log(r)

            switch (searchYtString) {
                case "the view":
                    sendYtCountsEmbed({
                        videoid: "v202rmUuBis",
                        message: interaction,
                        apikey: youtubeApiKeyRandomlyChosen,
                        type: "interaction"
                    });

                    break;
                case "life goes on": case "life goes on mv":

                    sendYtCountsEmbed({
                        videoid: "-5q5mZbe3V8",
                        message: interaction,
                        apikey: youtubeApiKeyRandomlyChosen,
                        type: "interaction"
                    });
                    break;
                case "help":
                    youtubeHelpMessageReply(interaction)
                    break;

                default:

                    // console.time("youtubei")
                    const videos = await youtube.search(searchYtString, {
                        type: "video", // video | playlist | channel | all
                    });

                    // console.timeEnd("youtubei")

                    if (videos.length <= 0) {
                        interaction.reply("I couldn't find any videos matching that term!")
                        logger.discordInfoLogger.info({ type: "searchYoutubeVideoTermNothingFound", query: searchYtString })
                    } else {

                        var videofound = false;
                        videos.forEach((video, videoIndex) => {
                            if (videofound === false) {
                                if (skipChannel(video.channel.id) || skipVideo(video.id)) {
                                    //skip channel
                                } else {
                                    videoID = videos[videoIndex].id
                                    // logger.discordDebugLogger.debug({ type: "searchStringForYouTube", firstResult: videos[0] })
                                    //logger.discordDebugLogger.debug({ type: "searchStringForYouTubevideoId", videoID: videoID });

                                    try {
                                        uploadStringToNewRelic(JSON.stringify({
                                            inputquery: ytquery,
                                            videoID,
                                            username: interaction.user.tag,
                                            userid: interaction.user.id,
                                            timeofrequest: new Date().toISOString(),
                                            type: "youtubeinteractionsearch"
                                        }));
                                    } catch (error) {
                                        console.error(error)
                                    }

                                    sendYtCountsEmbed({
                                        videoid: videoID,
                                        message: interaction,
                                        apikey: youtubeApiKeyRandomlyChosen,
                                        type: "interaction"
                                    });

                                    //if the software broke the first time, do it again
                                    setTimeout(() => {
                                        if (interaction.id) {
                                            if (interactionSentYetCache.get(interaction.id) === undefined) {
                                                sendYtCountsEmbed({
                                                    videoid: videoID,
                                                    message: interaction,
                                                    apikey: youtubeApiKeyRandomlyChosen,
                                                    type: "interaction"
                                                });
                                            }
                                        }
                                    }, 5000);
                                    logger.discordInfoLogger.info(videos[0].title, { type: "searchYoutubeVideoTermAndResponse", query: `${searchYtString}`, response: `${video.title}`, videoid: `${videoID}` })
                                    videofound = true;
                                }
                            }
                        });
                    }


                    break;
            }


            /*await scrapeyoutube.search(searchYtString).then(results => {
               
                // Unless you specify a type, it will only return 'video' results

                if (results.videos.length <= 0) {
                    message.reply("I couldn't find any videos matching that term!")
                }

                videoID = results.videos[0].id
                logger.discordDebugLogger.debug({ type: "searchStringForYouTube", firstResult: results.videos[0] })
                logger.discordDebugLogger.debug({ type: "searchStringForYouTubevideoId", videoID: videoID });

                //sendYtCountsEmbed(videoID, message, youtubeApiKeyRandomlyChosen)
               
            });*/
            //}
        }
    }
}

export async function youtubeVideoStats(message: Message, command, client, config, args) {
    const youtubeApiKeyRandomlyChosen = config.youtubeApiKeys[Math.floor(Math.random() * config.youtubeApiKeys.length)];

    var videoID = "dQw4w9WgXcQ"
    if (isUrl(args[0])) {
        videoID = videoID = convertUrlToVideoId(args[0].trim())
        sendYtCountsEmbed({
            videoid: videoID,
            message: message,
            apikey: youtubeApiKeyRandomlyChosen,
            type: "message"
        })
    } else {
        // Invalid url

        console.log("invalid url")
        const commandRegex = new RegExp(`${command}`, "i")

        const searchYtString = message.content.replace(/a!/i, "").trim().replace(commandRegex, "").trim()

        if (searchYtString.length === 0) {
            await youtubeHelpMessageReply(message)
        }
        else {
            /*
       //check if video ID is valid without accessing the youtube API
       var requestToYouTubeOembed = 'https://www.youtube.com/watch?v=' + searchYtString
       await request(requestToYouTubeOembed, async function (error, response, body) {
       if (!error && response.statusCode == 200) {
         console.log("URL is OK") // Print the google web page.
         videoID = getQueryParam('v', 'https://www.youtube.com/watch?v=' + searchYtString)
         console.log(videoID + " is the videoID")
         sendYtCountsEmbed(videoID,message,youtubeApiKeyRandomlyChosen)
       }  else {*/
            //video ID is not valid

            // search youtube for term instead
            //console.log("searching for:" + searchYtString)
            logger.discordDebugLogger.debug({ type: "searchStringForYouTube", searchYtString: searchYtString })
            //const r = await yts( searchYtString )

            //console.log(r)

            switch (searchYtString) {
                case "the view":
                    sendYtCountsEmbed({
                        videoid: "v202rmUuBis",
                        message: message,
                        apikey: youtubeApiKeyRandomlyChosen,
                        type: "message"
                    });
                    break;
                case "life goes on": case "life goes on mv":
                    sendYtCountsEmbed({
                        videoid: "-5q5mZbe3V8",
                        message: message,
                        apikey: youtubeApiKeyRandomlyChosen,
                        type: "message"
                    });
                    break;
                case "help":
                    youtubeHelpMessageReply(message)
                    break;

                default:

                    // console.time("youtubei")
                    const videos = await youtube.search(searchYtString, {
                        type: "video", // video | playlist | channel | all
                    });

                    // console.timeEnd("youtubei")

                    if (videos.length <= 0) {
                        message.reply("I couldn't find any videos matching that term!")
                        logger.discordInfoLogger.info({ type: "searchYoutubeVideoTermNothingFound", query: searchYtString })
                    } else {

                        var videofound = false;
                        videos.forEach((video, videoIndex) => {
                            if (videofound === false) {
                                if (skipChannel(video.channel.id) || skipVideo(video.id)) {
                                    //skip channel
                                } else {
                                    videoID = videos[videoIndex].id
                                    // logger.discordDebugLogger.debug({ type: "searchStringForYouTube", firstResult: videos[0] })
                                    //logger.discordDebugLogger.debug({ type: "searchStringForYouTubevideoId", videoID: videoID });

                                    sendYtCountsEmbed({
                                        videoid: videoID,
                                        message: message,
                                        apikey: youtubeApiKeyRandomlyChosen,
                                        type: "message"
                                    });
                                    logger.discordInfoLogger.info(videos[0].title, { type: "searchYoutubeVideoTermAndResponse", query: `${searchYtString}`, response: `${video.title}`, videoid: `${videoID}` })
                                    videofound = true;
                                }
                            }
                        });
                    }


                    break;
            }


            /*await scrapeyoutube.search(searchYtString).then(results => {
               
                // Unless you specify a type, it will only return 'video' results

                if (results.videos.length <= 0) {
                    message.reply("I couldn't find any videos matching that term!")
                }

                videoID = results.videos[0].id
                logger.discordDebugLogger.debug({ type: "searchStringForYouTube", firstResult: results.videos[0] })
                logger.discordDebugLogger.debug({ type: "searchStringForYouTubevideoId", videoID: videoID });

                //sendYtCountsEmbed(videoID, message, youtubeApiKeyRandomlyChosen)
               
            });*/
            //}
        }
    }
}
