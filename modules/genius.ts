const encodeUrl = require('encodeurl')
// Load the full build.
var _ = require('lodash');
const axios = require('axios')
const cio = require('cheerio-without-node-native');
const Discord = require('discord.js');
import {decode} from 'html-entities';

export async function geniusSongUrlHTMLExtract(geniusSongUrl) {
        //stores resulting data into a variable
        let { data } = await axios.get(geniusSongUrl);
        //Cherio inerpretation of HTML contents
        const $ = cio.load(data);
        //find lyrics inside div element, trim off whitespace
        //let lyrics = $('div[class="lyrics"]').text().trim();

            console.log("section apples")
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

export async function geniusLyrics(message,args,config) {

    // Set config defaults when creating the instance
    const geniusinstance = axios.create({
        baseURL: 'https://api.genius.com',
        headers: {
            'Authorization': "Bearer" + config.geniusapitoken
        }
    });
    
    var geniusQuery = message.content.trim().replace("a! genius","").replace("a!genius","").replace("a!lyrics","").replace("a! lyrics","").replace("a! lyric","").replace("a!lyric","").trim()

    if(geniusQuery.length === 0) {
        message.reply("Command: `a!lyrics <search>`")
    } else {

        message.channel.send(`Searching for: \`${geniusQuery}\` :mag_right:`)

    var geniusQueryUrlEncoded = encodeUrl(geniusQuery)

    var searchString = "/search" + "?access_token=" + config.geniusapitoken + "&" + "q=" + geniusQueryUrlEncoded
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
            var songLyricsHTML = await geniusSongUrlHTMLExtract(response.data.response.hits[0].result.url);
            //console.log(songLyricsHTML)

            var arrayOfTexts = await Discord.splitMessage(songLyricsHTML);

            console.log(arrayOfTexts)

            const arrayOfEmbeds = await arrayOfTexts.map(text => {
                return {
                    "description": text
                };
            })

            _.set(arrayOfEmbeds, '[0].title', response.data.response.hits[0].result.title_with_featured)
            _.set(arrayOfEmbeds, '[0].author.name', response.data.response.hits[0].result.primary_artist.name)
            _.set(arrayOfEmbeds, '[0].thumbnail.url', response.data.response.hits[0].result.song_art_image_url)
            _.set(arrayOfEmbeds, '[0].author.icon_url', response.data.response.hits[0].result.primary_artist.image_url)
            const lastItem = arrayOfEmbeds[arrayOfEmbeds.length - 1]
            _.set(lastItem, 'footer.text', `Powered by Genius | ${response.data.response.hits[0].result.stats.pageviews} pageviews`)

            arrayOfEmbeds.forEach(embed => {
                message.channel.send({embed: embed})
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