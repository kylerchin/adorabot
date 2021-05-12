const encodeUrl = require('encodeurl')
const axios = require('axios')
const cio = require('cheerio-without-node-native');

export async function geniusSongUrlHTMLExtract(geniusSongUrl) {
    try {
        //Attempts fetching of URL but in try / catch block so nothing explodes
        //stores resulting data into a variable
        let { data } = await axios.get(geniusSongUrl);
        //Cherio inerpretation of HTML contents
        const $ = cio.load(data);
        //find lyrics inside div element, trim off whitespace
        //let lyrics = $('div[class="lyrics"]').text().trim();
        if (true) {
            console.log("section apples")
			var lyrics = ''
			$('div[class="lyrics"]').each((i, elem) => {
				if($(elem).text().length !== 0) {
                    let snippet = $(elem).html()
                    .replace(/<br><br>/g, 'AdorabotTwoLine00x00')
                    .replace(/<br>/g, 'AdorabotOneLine00x00')
                    .replace(/\*/g, '\\*')
                    .replace(/<\/? *i[^>]*>/g, '*')
                    .replace(/<\/? *b*>/g, '**')
                    .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '')
                    .replace(/AdorabotTwoLine00x00/g, '\n\n')
                    .replace(/AdorabotOneLine00x00/g, '\n')
                   // .replace(/\n\n\n/g, '\n')
                    .replace(/\n\n\n/g, '\n');
                    console.log($(elem).html() + " => " + snippet)
					lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
				}
    	})
		}
		if (!lyrics) {return null};
		return lyrics.trim();

    } catch {
        console.log("Ooops fucked up"
        )
    }
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

        message.channel.send(`Searching for: \`${geniusQuery}\``)

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
            console.log(songLyricsHTML)

            try {
                message.channel.send(songLyricsHTML)
            } catch (geniusmessagefailederror) {
                console.error(geniusmessagefailederror)
            }
            
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