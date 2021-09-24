import { Message } from "discord.js";
const { config } = require('./../../config.json');
var axios = require('axios');
interface spotifySearchInterface {
    message: Message;
    client: any;
    command: string;
    config: any;
}

export async function spotifySearchForStatsFromMessage(spotifySearchArgs: spotifySearchInterface) {
    const searchSpotifyString = spotifySearchArgs.message.content.replace(spotifySearchArgs.config.prefix, "").trim().replace(spotifySearchArgs.command,"").trim()
    const spotifySafeSearchString = searchSpotifyString.replace(/\n/gm," ").replace(/\"/gm,"\\\"").replace(/\'/gm,'\\\'').replace(/\\/gm,'\\\\')
    const spotifySearchVariable = `{"searchTerm":"${spotifySafeSearchString}","offset":0,"limit":10,"numberOfTopResults":5}`
    const encodedSpotifyVariable = encodeURIComponent(spotifySearchVariable)

var config = {
  method: 'get',
  url: `https://api-partner.spotify.com/pathfinder/v1/query?operationName=searchDesktop&variables=${encodedSpotifyVariable}&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2275bbf6bfcfdf85b8fc828417bfad92b7cd66bf7f556d85670f4da8292373ebec%22%7D%7D`,
  headers: { 
    'authority': 'api-partner.spotify.com', 
    'origin': 'https://open.spotify.com/', 
    'referer': 'https://open.spotify.com/', 
    'Authorization': 'Bearer BQB-gVCSCxt1YdXdXKxupwoX2oeKs-pEekNG70kAHcd-6JgVL2ehFRI8ma8ixXV31BpJJnmAjG-VaR7SeZjsmEDEajUC3cibn8YvVLrQOHrGJiBme7NxsGIANlFkZmPHoRvaDxmNHziZwC7VdYag79VTDtcil6lmhHfTNlKR0QbJ_MDdNDgkMSTjDBrzrjTeU0gVAnfFYtFiqtZQIAzvFT6KsGflIENQ163RCEvhLRBNZnTR2g_ORNBH9_pQ_nTpTFnMxu9FYl8gPQpBcUU0uNjU7Tuxt7GisYTHCPj4j6Tz6aFIC5UrA1sL'
  }
};

axios(config)
.then(function (response) {
  console.log(response.data);
  spotifySearchArgs.message.reply({content: `${response.data.data.search.topResults.items[0].name}`})
})
.catch(function (error) {
  console.log(error);
});

}