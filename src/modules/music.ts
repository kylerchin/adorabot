const isUrl = require("is-url");
const scrapeyoutube = require('scrape-youtube').default;
const fs = require('fs');
const ytdl = require('ytdl-core');
//import { sendYtCountsEmbed } from "./sendYtEmbed";
import { logger } from "./logger";
const getQueryParam = require('get-query-param')
import {Message} from 'discord.js'

interface musicParamsInterface {
    message: Message;
    command: any;
    args: any;
    client: any;
}

const queue = new Map();

export async function getYoutubeIDFromMessage(musicParams: musicParamsInterface) {
    const youtubeApiKeyRandomlyChosen = config.youtubeApiKeys[Math.floor(Math.random() * config.youtubeApiKeys.length)];

        var videoID = "dQw4w9WgXcQ"
        if (isUrl(musicParams.args[0])) {
            // Valid url
            if (musicParams.args[0].includes("youtu.be/")) {
                var precurser = musicParams.args[0].replace("youtu.be/", "www.youtube.com/watch?v=")
            } else {
                var precurser = musicParams.args[0]
            }
            videoID = getQueryParam('v', precurser)
            //sendYtCountsEmbed(videoID, msg, youtubeApiKeyRandomlyChosen)
            return videoID;
        } else {
            // Invalid url
    
            console.log("invalid url")
    
            const searchYtString = musicParams.message.content.replace("a!", "").replace(musicParams.command, "").trim()
    
            if (searchYtString.length === 0) {
               // await youtubeHelpMessageReply(msg)

               await musicParams.message.reply("Options: `a!play <youtube url / search string>`\nA search looks like `a!play BTS Dynamite`\n" +
               "Acceptable URLS include\n" +
               "Youtube `a!play https://youtube.com/watch?v=FFmdTU4Cpr8`\n" +
               "YouTu.be `a!play https://youtu.be/FFmdTU4Cpr8`\n" +
               "Youtube Music `a!play https://music.youtube.com/watch?v=FFmdTU4Cpr8`")
            
            return false;
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
                        musicParams.message.reply("I couldn't find any videos matching that term!")
                    }
    
                    videoID = results.videos[0].id
                    logger.discordDebugLogger.debug({ type: "searchStringForYouTube", firstResult: results.videos[0] })
                    logger.discordDebugLogger.debug({ type: "searchStringForYouTubevideoId", videoID: videoID });
    
                    return videoID
                });
                //}
            }
        }
}

export  async function playMusic(musicParams: musicParamsInterface) {
    var videoIDResult = await getYoutubeIDFromMessage(musicParams);

    const serverQueue = queue.get(musicParams.message.guild.id);

    if (videoIDResult !== false) {
       // const args = message.content.split(" ");

        const voiceChannel = musicParams.message.member.voice.channel;
        if (!voiceChannel)
          return musicParams.message.channel.send(
            "You need to be in a voice channel to play music!"
          );
        const permissions = voiceChannel.permissionsFor(musicParams.message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
          return musicParams.message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
          );
        }
      
        const songInfo = await ytdl.getInfo("http://www.youtube.com/watch?v=" + videoIDResult);
        const song = {
              title: songInfo.videoDetails.title,
              url: songInfo.videoDetails.video_url,
         };
      
        if (!serverQueue) {
          const queueContruct = {
            textChannel: musicParams.message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
          };
      
          queue.set(musicParams.message.guild.id, queueContruct);
      
          queueContruct.songs.push(song);
      
          try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(musicParams.message.guild, queueContruct.songs[0]);
          } catch (err) {
            console.log(err);
            queue.delete(musicParams.message.guild.id);
            return musicParams.message.channel.send(err);
          }
        } else {
          serverQueue.songs.push(song);
          return musicParams.message.channel.send(`${song.title} has been added to the queue!`);
        }
    }
}