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
    'Authorization': 'Bearer BQA5yHfhPETB1QnIq_7F-b5LxqKe-8r-9M_x9Mpgpd84GPsFswc6TYfqgpyMD-pY8WwdwVsnPH_WTiaRjwaym4OePNbyw9RxB3nxYHkXgELE9efmO80buq4cesw7FuEFyl15tCzBsql0000i5X5S0n6rWCheu7eCkZSv4UIhlrP8MPkS1jUKfJhzT_f-OB32RAloF5SyK1PemILGxwldq9fOGbo236QxTKSGN8aUGI08CVSkuXIT5_GSFjK8l4UvhCs3yotT6LflzvjW0GtFCVqLPHrUdi9yyMTn2Kd7fIkw5FuWJWicac8l'
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