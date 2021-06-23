const { config } = require('./../config.json');

export async function verboseDiscordLog(logMessage,client) {
    // Fetch a channel by its id
    client.channels.cache.forEach(async function(channel) {
      //console.log(channel.id)
      if(channel.id === config.verboseChannel) {
        //console.log("this boi uwu")
        await channel.send(logMessage)
        return true;
      }
    })
  }