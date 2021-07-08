const encodeUrl = require('encodeurl')
// Load the full build.
var _ = require('lodash');
const axios = require('axios')
const cio = require('cheerio-without-node-native');
const Discord = require('discord.js');
import {decode} from 'html-entities';
import { logger,tracer,span } from './logger';
import { asyncForEach } from './util';
const forEach = require("for-each")
import {Message} from 'discord.js'

export async function geniusSongUrlHTMLExtract(geniusSongUrl) {
        //stores resulting data into a variable
        
        
          
        let { data } = await axios.get(geniusSongUrl);
        
        //Cherio inerpretation of HTML contents
        const $ = cio.load(data);
        //find lyrics inside div element, trim off whitespace
        //let lyrics = $('div[class="lyrics"]').text().trim();

			var lyrics = ''

            $('[data-scrolltrigger-pin]').each((i, elem) => {
				if($(elem).text().length !== 0) {
                    let snippet = decode($(elem).html()
                    .replace(/<br><br>/g, 'AdorabotTwoLine00x00')
                    .replace(/<br>/g, 'AdorabotOneLine00x00')
                    .replace(/\*/g, '\\*')
                    .replace(/<\/? *i[^>]*>/g, '*')
                    .replace(/<\/b><b>/g,"")
                    .replace(/<\/?b*>/g, '**')
                    .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '')
                    .replace(/AdorabotTwoLine00x00/g, '\n\n')
                    .replace(/AdorabotOneLine00x00/g, '\n')
                   // .replace(/\n\n\n/g, '\n')
                    .replace(/\n\n\n/g, '\n'));
                 //   console.log($(elem).html() + " => " + snippet)
				//	lyrics = lyrics + $('[data-scrolltrigger-pin]').html(snippet).trim();
                    lyrics += snippet + "\n\n";
				}
    	})

	
    	
		if (!lyrics) {return null};
		return lyrics.trim();

    
}

export async function geniusShowOtherSongs(response,message: Message) {
    logger.discordInfoLogger.info("type of response.data.response.hits is " + typeof response.data.response.hits)
    var embedsArrayUngroomed = response.data.response.hits.map((hit) => {
        return {
            "title": hit.result.title,
            "url": hit.result.url,
            "author": {
                "name" : hit.result.primary_artist.name.substring(0, 255),
                "icon_url": hit.result.primary_artist.image_url
            },
            "thumbnail": {
                "url": hit.result.song_art_image_url
            }
        }
    })

    var groupedEmbeds = _.chunk(embedsArrayUngroomed, 10);
    
    var messageOfOtherSongs = await message.reply({"embeds": groupedEmbeds[0], "content": "run `a!lyrics <song name>` to fetch the correct one! If that fails, try `a!lyrics <artist name> <song name>`"})

    
   // Create a reaction collector
                //reaction.emoji.name === '🗑' && user.id === lyricsRequester
     const deleteFilter = (reaction, user) => {
                    console.log(reaction)
                    console.log(user)
                    if(user.id === message.author.id && reaction.emoji.name === "🗑") {
                        console.log("delete this message, trash icon clicked")
                        return true;
                    } else {
                        return false;
                    }

                }

                const deleteCollector = messageOfOtherSongs.createReactionCollector(deleteFilter);

                deleteCollector.on('collect', async (r) => {
                    console.log("YUH DELETE THIS")
                    //const reaction = collected.first()

                    messageOfOtherSongs.delete().catch()
                    
                    logger.discordInfoLogger.info(r);
                    
                    logger.discordInfoLogger.info(`Collected ${r.emoji.name}`)});
                deleteCollector.on('end', collected => logger.discordInfoLogger.info(`Collected ${collected.size} items`));
                
                messageOfOtherSongs.react("🗑").then((reaction) => {
                    //lastMessageToListenTo.react('❓')
                })
    }
}

export async function geniusLyrics(message:Message,args,config) {

    // Set config defaults when creating the instance
    const geniusinstance = axios.create({
        baseURL: 'https://api.genius.com',
        headers: {
            'Authorization': "Bearer " + config.geniusapitoken
        }
    });
    
    var geniusQuery = message.content.trim().replace("a! genius","").replace("a!genius","").replace("a!lyrics","").replace("a! lyrics","").replace("a! lyric","").replace("a!lyric","").trim()

    if(geniusQuery.length === 0) {
        message.reply("Command: `a!lyrics <search>`")
    } else {

        var searchingForQueryMessage;

       message.channel.send(`Searching for: \`${geniusQuery}\` :mag_right:`).then((searchingQueryAlert) => { searchingForQueryMessage = searchingQueryAlert})

    var geniusQueryUrlEncoded = encodeUrl(geniusQuery)

    var searchString = "/search" + "?" + "q=" + geniusQueryUrlEncoded
    // Make a request for a user with a given ID
    geniusinstance.get(searchString)
    .then( async function (response) {
    // handle success
    console.log(response);
    console.log(response.data)
    console.log(response.data.meta.status)
    console.log(response.data.response.hits[0])

    if(response.data.meta.status === 200) {
        //genius responded successfully
        console.log(response.data.response.hits.length)
        if(response.data.response.hits.length === 0) {
            message.reply("I couldn't find anything, try modifying your search")
        } else {
            //found something
            var songLyricsHTML;
             songLyricsHTML = await geniusSongUrlHTMLExtract(response.data.response.hits[0].result.url);
            
            //console.log(songLyricsHTML)

            var arrayOfTexts = await Discord.splitMessage(songLyricsHTML);

            console.log(arrayOfTexts)

            const arrayOfEmbeds = await arrayOfTexts.map(text => {
                return {
                    "description": text
                };
            })

            _.set(arrayOfEmbeds, '[0].title', response.data.response.hits[0].result.title_with_featured.substring(0, 255))
            _.set(arrayOfEmbeds, '[0].author.name', response.data.response.hits[0].result.primary_artist.name.substring(0, 255))
            _.set(arrayOfEmbeds, '[0].thumbnail.url', response.data.response.hits[0].result.song_art_image_url)
            _.set(arrayOfEmbeds, '[0].url', response.data.response.hits[0].result.url)
            _.set(arrayOfEmbeds, '[0].author.icon_url', response.data.response.hits[0].result.primary_artist.image_url)
            const lastItem = arrayOfEmbeds[arrayOfEmbeds.length - 1]
            _.set(lastItem, 'footer.text', `Powered by Genius | ${response.data.response.hits[0].result.stats.pageviews} pageviews.\nWrong song? Click ❓ to see other song options.`)

            //Get Color as Hex String from Genius API response, remove the hashtag
            const extractHex = response.data.response.hits[0].result.song_art_primary_color.replace(/#/g, '')

            //Add 0x and give it to parse int
            const colorNumber = parseInt("0x" + extractHex)

            console.log(colorNumber)

            //For every array, set the color
            arrayOfEmbeds.map(eachEmbed => eachEmbed.color = colorNumber)

            var lyricsRequester = message.author.id;

            var arrayOfMessagesSentForLyrics:Array<any> = [];
            //arrayOfMessagesSentForLyrics.push(searchingForQueryMessage)
        
            await asyncForEach(arrayOfEmbeds, async (embed) => {
                var messageObject = await message.channel.send({embeds: [embed]})
                arrayOfMessagesSentForLyrics.push(messageObject)
            })

                console.log(arrayOfMessagesSentForLyrics)

                //Basically, if the user clicks on the trash can, it deletes the embeds
                //console.log(arrayOfMessagesSentForLyrics[arrayOfEmbeds.length - 1])
                var lastMessageToListenTo = await arrayOfMessagesSentForLyrics[arrayOfEmbeds.length - 1]
    
                // Create a reaction collector
                //reaction.emoji.name === '🗑' && user.id === lyricsRequester
                const deleteFilter = (reaction, user) => {
                    console.log(reaction)
                    console.log(user)
                    if(user.id === lyricsRequester && reaction.emoji.name === "🗑") {
                        console.log("delete this message, trash icon clicked")
                        return true;
                    } else {
                        return false;
                    }
                }

                // Create a reaction collector
                //reaction.emoji.name === '🗑' && user.id === lyricsRequester
                const showOtherResultsFilter = (reaction, user) => {
                    console.log(reaction)
                    console.log(user)
                    if(user.id === lyricsRequester && reaction.emoji.name === "❓") {
                        console.log("respond with other results")
                        return true;
                    } else {
                        return false;
                    }
                }

                const deleteCollector = lastMessageToListenTo.createReactionCollector(deleteFilter);
                const otherResultsCollector = lastMessageToListenTo.createReactionCollector(showOtherResultsFilter);
                deleteCollector.on('collect', async (r) => {
                    console.log("YUH DELETE THIS")
                    //const reaction = collected.first()

                    arrayOfMessagesSentForLyrics.forEach(async (eachMessageSentForLyrics) => {
                        console.log("delete msg")
                        console.log(eachMessageSentForLyrics)
                        eachMessageSentForLyrics.delete()
                    })
                    console.log(searchingForQueryMessage)
                    try {searchingForQueryMessage.delete()} catch{}
                    
                    logger.discordInfoLogger.info(r);
                    
                    logger.discordInfoLogger.info(`Collected ${r.emoji.name}`)});
                deleteCollector.on('end', collected => logger.discordInfoLogger.info(`Collected ${collected.size} items`));

                otherResultsCollector.on('collect',  async (r) => {
                    console.log("show similar results")
                    //const reaction = collected.first()

                    geniusShowOtherSongs(response,message)
                    
                    logger.discordInfoLogger.info(r);
                    
                    logger.discordInfoLogger.info(`Collected ${r.emoji.name}`)})
            
                    lastMessageToListenTo.react("🗑").then((reaction) => {
                        lastMessageToListenTo.react('❓')
                    })
        }
    } else {
        message.reply("Something went wrong! Try again in a bit? Ooop-")
    }

    })
    .catch(function (error) {
    // handle error
    console.log(error);
    })
    .then(function () {
    // always executed
    });    

    }

    

}