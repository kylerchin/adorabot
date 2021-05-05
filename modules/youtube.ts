const isUrl = require("is-url");
const scrapeyoutube = require('scrape-youtube').default;
import { sendYtCountsEmbed } from "./sendYtEmbed";
import { logger } from "./logger";
const getQueryParam = require('get-query-param')

export async function youtubeHelpMessageReply(message) {
    message.reply("The correct format for Youtube Video Searches is `a!youtube [youtube url / search string]`\n" +
        "A search looks like `a!youtube BTS Dynamite`\n" +
        "Acceptable URLS include\n" +
        "Youtube `https://youtube.com/watch?v=FFmdTU4Cpr8`\n" +
        "YouTu.be `a!youtube https://youtu.be/FFmdTU4Cpr8`\n" +
        "Youtube Music `a!youtube https://music.youtube.com/watch?v=FFmdTU4Cpr8`")
}

export async function youtubeVideoStats(msg, command, client, config, args) {
    const youtubeApiKeyRandomlyChosen = config.youtubeApiKeys[Math.floor(Math.random() * config.youtubeApiKeys.length)];

    var videoID = "dQw4w9WgXcQ"
    if (isUrl(args[0])) {
        // Valid url
        if (args[0].includes("youtu.be/")) {
            var precurser = args[0].replace("youtu.be/", "www.youtube.com/watch?v=")
        } else {
            var precurser = args[0]
        }
        videoID = getQueryParam('v', precurser)
        sendYtCountsEmbed(videoID, msg, youtubeApiKeyRandomlyChosen)
    } else {
        // Invalid url

        console.log("invalid url")

        const searchYtString = msg.content.replace("a!", "").replace(command, "").trim()

        if (searchYtString.length === 0) {
            await youtubeHelpMessageReply(msg)
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
         sendYtCountsEmbed(videoID,msg,youtubeApiKeyRandomlyChosen)
       }  else {*/
            //video ID is not valid

            // search youtube for term instead
            //console.log("searching for:" + searchYtString)
            logger.discordDebugLogger.debug({ type: "searchStringForYouTube", searchYtString: searchYtString })
            //const r = await yts( searchYtString )

            //console.log(r)

            await scrapeyoutube.search(searchYtString).then(results => {
                // Unless you specify a type, it will only return 'video' results

                if (results.videos.length <= 0) {
                    msg.reply("I couldn't find any videos matching that term!")
                }

                videoID = results.videos[0].id
                logger.discordDebugLogger.debug({ type: "searchStringForYouTube", firstResult: results.videos[0] })
                logger.discordDebugLogger.debug({ type: "searchStringForYouTubevideoId", videoID: videoID });

                sendYtCountsEmbed(videoID, msg, youtubeApiKeyRandomlyChosen)
            });
            //}
        }
    }
}