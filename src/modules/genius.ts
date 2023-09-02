import encodeUrl = require('encodeurl');
// Load the full build.
var _ = require('lodash');
import axios = require('axios');
import cio = require('cheerio-without-node-native');
import Discord = require('discord.js');
import { splitMessage } from './splitMessage';
import {Util,ReactionCollector,CommandInteraction,Message} from 'discord.js'
import {decode} from 'html-entities';
import { initial } from 'lodash';
import { logger,tracer,span } from './logger';
import { asyncForEach,hexCodeToColorNumber } from './util';
import forEach = require("for-each");
import { config } from './../../config.json';

 // Set config defaults when creating the instance
 const geniusinstance = axios.create({
    baseURL: 'https://api.genius.com',
    headers: {
        'Authorization': "Bearer " + config.geniusapitoken
    }
});

export async function geniusSongUrlHTMLExtract(geniusSongUrl) {
    try {
                //stores resulting data into a variable
        
        
          
                let { data } = await axios.get(geniusSongUrl);
        
                //Cherio inerpretation of HTML contents
                const $ = cio.load(data);
                //find lyrics inside div element, trim off whitespace
                //let lyrics = $('div[class="lyrics"]').text().trim();
        
                    var lyrics = ''
        
                    $('[class^=Lyrics__Container]').each((i, elem) => {
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
        
    } catch (bruhsdflj) {
        console.error(bruhsdflj)
    }

    
}

export async function geniusShowOtherSongs(response,requesterid,isInteractionOrMessage,initialRequestObject) {
    try {
        logger.discordInfoLogger.info("type of response.data.response.hits is " + typeof response.data.response.hits)
        var embedsArrayUngroomed = response.data.response.hits.map((hit) => {
            //const colorForSong = hexCodeToColorNumber(hit.result.song_art_primary_color)
    
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
        
        var messageOfOtherSongs
    
        var otherSongsResponseObject = {"embeds": groupedEmbeds[0], "content": "run `a!lyrics <song name>` to fetch the correct one! If that fails, try `a!lyrics <artist name> <song name>`"}
    
        if(isInteractionOrMessage === 'message') {
             messageOfOtherSongs = await initialRequestObject.reply(otherSongsResponseObject)
    
        }
    
        if(isInteractionOrMessage === 'interaction') {
            messageOfOtherSongs = await initialRequestObject.followUp(otherSongsResponseObject)
    
       }
    
        
       // Create a reaction collector
                    //reaction.emoji.name === '🗑' && user.id === lyricsRequester
         const deleteFilter = (reaction, user) => user.id === requesterid && reaction.emoji.name === "🗑" && user.id !== initialRequestObject.client;
    
                    const deleteCollector = messageOfOtherSongs.createReactionCollector({filter: deleteFilter});
    
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
    } catch (error) {
        console.error(error)
    }
    
    }

    export async function geniusRetrieveArrayOfMessageObjects(geniusQuery) {

    var geniusQueryUrlEncoded = encodeUrl(geniusQuery)

    var searchString = "/search" + "?" + "q=" + geniusQueryUrlEncoded
    // Make a request for a user with a given ID
    var response = await geniusinstance.get(searchString)
    // handle success
    console.log(response);
    console.log(response.data)
    console.log(response.data.meta.status)
    console.log(response.data.response.hits[0])
    
    if(response.data.meta.status === 200) {
        //genius responded successfully
        console.log(response.data.response.hits.length)
        if(response.data.response.hits.length === 0) {
            //messageOrInteraction.reply("I couldn't find anything, try modifying your search")
            return ['error','404']
        }
         else {
            //found something
            var songLyricsHTML;
             songLyricsHTML = await decideWhichGeniusUrlToUse(response.data.response);
            
            console.log(songLyricsHTML)

            logger.discordInfoLogger.info({type: 'songlyricshtml', message: songLyricsHTML})

            var arrayOfTexts: Array<string> = [];

            var arrayOfTextsSingleLined = await splitMessage(songLyricsHTML, {char : `\n`});;
            
            var arrayOfTextsDoubleLined = await splitMessage(songLyricsHTML, {char : `\n\n`});

            if (arrayOfTextsDoubleLined === arrayOfTextsSingleLined) {
                arrayOfTexts = arrayOfTextsDoubleLined
            } else {
                arrayOfTexts = arrayOfTextsSingleLined
            }

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
           // const extractHex = response.data.response.hits[0].result.song_art_primary_color.replace(/#/g, '')

            //Add 0x and give it to parse int
          //  const colorNumber = parseInt("0x" + extractHex)

         //   console.log(colorNumber)

            //For every array, set the color
          //  arrayOfEmbeds.map(eachEmbed => eachEmbed.color = colorNumber)

            return ['success',arrayOfEmbeds,response];
        }
    } else {
        //messageOrInteraction.reply("Something went wrong! Try again in a bit? Ooop-")
        return ['error','500'];
        
    }

};

    export async function geniusLyricsFromInteraction(interaction) {
        try {
            var arrayOfMessagesSentForLyrics:Array<any> = [];
            var lyricsRequester = interaction.user.id;
    
            var geniusQuery = interaction.options.get('search').value
    
            var searchingForQueryMessage;

            if (geniusQuery) {
                interaction.reply(`Searching for: \`${geniusQuery}\` :mag_right:`).then((searchingQueryAlert) => { searchingForQueryMessage = searchingQueryAlert})
    
                var arrayOfMessageObjectsResponse = await geniusRetrieveArrayOfMessageObjects(geniusQuery)
        
                if (arrayOfMessageObjectsResponse[0] === 'success') {
                    await asyncForEach(arrayOfMessageObjectsResponse[1], async (embed) => {
                        var messageObject = await interaction.channel.send({embeds: [embed]})
                        arrayOfMessagesSentForLyrics.push(messageObject)
                    })
        
                    await reactionsInitialSet(arrayOfMessagesSentForLyrics, lyricsRequester,searchingForQueryMessage,arrayOfMessageObjectsResponse[2],'interaction',interaction)
                }
                if (arrayOfMessageObjectsResponse[0] === 'error') {
                    if(arrayOfMessageObjectsResponse[1] === '500') {
                        interaction.followUp('Something went wrong! Try again in a bit? Ooop-')
                    }
                    if(arrayOfMessageObjectsResponse[1] === '404') {
                        interaction.followUp("I couldn't find anything, try modifying your search")
                    }
                }
            }
    
           
            
        }
      catch (err) {
        console.error(err)
      }
    }

async function reactionsInitialSet(arrayOfMessagesSentForLyrics,lyricsRequester, searchingForQueryMessage, response, isInteractionOrMessage,initialRequestObject) {
    console.log(arrayOfMessagesSentForLyrics)

                //Basically, if the user clicks on the trash can, it deletes the embeds
                //console.log(arrayOfMessagesSentForLyrics[arrayOfEmbeds.length - 1])
                var lastMessageToListenTo = await arrayOfMessagesSentForLyrics[arrayOfMessagesSentForLyrics.length - 1]
    
                // Create a reaction collector
                //reaction.emoji.name === '🗑' && user.id === lyricsRequester
                const deleteFilter = (reaction, user) => {
                    console.log(reaction)
                    console.log(user)
                    if(user.id === lyricsRequester && reaction.emoji.name === "🗑" && user.id != lastMessageToListenTo.author.id) {
                        console.log("delete this message, trash icon clicked")
                        return true;
                    } else {
                        return false;
                    }
                }

                // Create a reaction collector
                //reaction.emoji.name === '🗑' && user.id === lyricsRequester
                const showOtherResultsFilter = (reaction, user) => user.id === lyricsRequester && reaction.emoji.name === "❓"  && user.id != lastMessageToListenTo.author.id

                const deleteCollector:ReactionCollector = lastMessageToListenTo.createReactionCollector({filter: deleteFilter});
                const otherResultsCollector:ReactionCollector = lastMessageToListenTo.createReactionCollector({filter: showOtherResultsFilter});
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

                    geniusShowOtherSongs(response,lyricsRequester,isInteractionOrMessage,initialRequestObject)
                    
                    logger.discordInfoLogger.info(r);
                    
                    logger.discordInfoLogger.info(`Collected ${r.emoji.name}`)})
            
                    lastMessageToListenTo.react("🗑").then((reaction) => {
                        lastMessageToListenTo.react('❓')
                    })
}

function isBadGeniusUrl(url) {
    var arrayOfBadUrlsWeDontWant = [
        "https://genius.com/Genius-korea-genius-korea-communitys-favorite-songs-of-2021-so-far-annotated"
    ]

    return arrayOfBadUrlsWeDontWant.includes(url)
}

function isBadGeniusArtistUrl(url) {
    var arrayOfBadArtistUrlsWeDontWant = [
        'https://genius.com/artists/Genius-korea'
    ]

    return arrayOfBadArtistUrlsWeDontWant.includes(url)
}

async function decideWhichGeniusUrlToUse(response) {
    
    console.log(response)

        //not the http response.... the genius response
    return new Promise(async (resolve, reject) => {
        var hitNumberToUse = decideWhichGeniusNumberToUse(response);

        geniusSongUrlHTMLExtract(response.hits[hitNumberToUse].result.url).then((geniusSongUrlExtract) => {
            resolve(geniusSongUrlExtract)
        })
        .catch((error) => {
            reject(error)
        })
      });
}

function decideWhichGeniusNumberToUse(response) {
try {
    
    //not the http response.... the genius response
    var hitNumberCounter:number = 0;
    var hitNumberToUse:number = 0;
    
        console.log('response inside genius number to use', response)
    
    var numberOfMaxHits = response.hits.length        

    while ((hitNumberCounter < numberOfMaxHits)) {
        var workingOnThisResult = response.hits[hitNumberCounter].result;
        console.log(workingOnThisResult)
        if (isBadGeniusUrl(workingOnThisResult.url) || isBadGeniusArtistUrl(workingOnThisResult.primary_artist.url)) {
            //do nothing, skip to the next hit
            console.log('skip genius hit', hitNumberCounter)

            if (hitNumberCounter = numberOfMaxHits - 1) {
                //this entry is the last
                return 0;
            }
        } else {
            hitNumberToUse = hitNumberCounter;
            console.log('use this genius hit', hitNumberCounter)
            break;
        }
        hitNumberCounter = hitNumberCounter + 1;
    }

    console.log('hitNumberToUse',  hitNumberToUse)

    return hitNumberToUse;
} catch (
    error
) {
    console.error(error)
}
}

export async function geniusLyrics(message:Message,args, client) {

   try {
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
 //   console.log(response.data.response.hits[0])

    if(response.data.meta.status === 200) {
        //genius responded successfully
        console.log(response.data.response.hits.length)
        if(response.data.response.hits.length === 0) {
            message.reply("I couldn't find anything, try modifying your search")
        } else {
            //found something
            var songLyricsHTML;
             songLyricsHTML = await decideWhichGeniusUrlToUse(response.data.response);
            
          //  console.log(songLyricsHTML)

            logger.discordInfoLogger.info({type: 'songlyricshtml', message: songLyricsHTML})

            var arrayOfTexts = await splitMessage(songLyricsHTML);

            console.log(arrayOfTexts)

            const arrayOfEmbeds = await arrayOfTexts.map(text => {
                return {
                    "description": text
                };
            })

            var whichHitNumberToUse = decideWhichGeniusNumberToUse(response.data.response);

            var resultToUse = response.data.response.hits[whichHitNumberToUse].result;

            _.set(arrayOfEmbeds, '[0].title', resultToUse.title_with_featured.substring(0, 255))
            _.set(arrayOfEmbeds, '[0].author.name', resultToUse.primary_artist.name.substring(0, 255))
            _.set(arrayOfEmbeds, '[0].thumbnail.url', resultToUse.song_art_image_url)
            _.set(arrayOfEmbeds, '[0].url', resultToUse.url)
            _.set(arrayOfEmbeds, '[0].author.icon_url', resultToUse.primary_artist.image_url)
            const lastItem = arrayOfEmbeds[arrayOfEmbeds.length - 1]
            _.set(lastItem, 'footer.text', `Powered by Genius | ${resultToUse.stats.pageviews} pageviews.\nWrong song? Click ❓ to see other song options.`)

            //Get Color as Hex String from Genius API response, remove the hashtag
           // const extractHex = response.data.response.hits[0].result.song_art_primary_color.replace(/#/g, '')

            //Add 0x and give it to parse int
        //    const colorNumber = parseInt("0x" + extractHex)

          //  console.log(colorNumber)

            //For every array, set the color
         //   arrayOfEmbeds.map(eachEmbed => eachEmbed.color = colorNumber)

            var lyricsRequester = message.author.id;

            var arrayOfMessagesSentForLyrics:Array<any> = [];
            //arrayOfMessagesSentForLyrics.push(searchingForQueryMessage)
        
            await asyncForEach(arrayOfEmbeds, async (embed) => {
                var messageObject = await message.channel.send({embeds: [embed]})
                arrayOfMessagesSentForLyrics.push(messageObject)
            })

            await reactionsInitialSet(arrayOfMessagesSentForLyrics, lyricsRequester,searchingForQueryMessage,response,'message',message)
        }
    } else {
        message.reply("Something went wrong! Try again in a bit? Ooop-")
    }

    })
    .catch(function (error) {
    // handle error
    console.error(error);
    })
    .then(function () {
    // always executed
    });    

    }

    

    } catch (errorgenius) {
        console.error(errorgenius)
    }
}