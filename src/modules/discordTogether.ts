interface ytpartyargs {
    message: any;
    client: any;
}

export function ytparty(ytpartyargs: ytpartyargs) {
 try {
    if (ytpartyargs.message.guild) {
        //  console.log(ytpartyargs.message.member.voice)
       //   if(ytpartyargs.message.member.voice.channel) {
           if (ytpartyargs.message.member.voice.channel) {
              ytpartyargs.client.discordTogether.createTogetherCode(ytpartyargs.message.member.voice.channel.id, 'youtube').then(async invite => {
                  return ytpartyargs.message.reply({embeds: [{
                      "title": `Click here to join YouTube Party in ${ytpartyargs.message.member.voice.channel.name}`,
                      "description": "To watch simultaniously, turn on shared playback in the bottom left.",
                      "url": `${invite.code}`
                  }]});
              });
           }  
          else {
            return ytpartyargs.message.reply('Join a voice channel to use YouTube Party!')
          }
      } else {
          return ytpartyargs.message.reply('YouTube Parties can only be started in a server.')
      }
 } catch (ytparty) {
    console.error(ytparty)
 }
}

export function fishing(ytpartyargs: ytpartyargs) {
    if (ytpartyargs.message.guild) {
      //  console.log(ytpartyargs.message.member.voice)
     //   if(ytpartyargs.message.member.voice.channel) {
         if (ytpartyargs.message.member.voice.channel) {
            ytpartyargs.client.discordTogether.createTogetherCode(ytpartyargs.message.member.voice.channel.id, 'fishing').then(async invite => {
                return ytpartyargs.message.reply({embeds: [{
                    "title": `Click here to join Fishington in ${ytpartyargs.message.member.voice.channel.name}`,
                    "url": `${invite.code}`
                }]});
            });
         }  
        else {
          return ytpartyargs.message.reply('Join a voice channel to play the Fishing game!')
        }
    } else {
        return ytpartyargs.message.reply('The Fishing Game can only be started in a server.')
    }
}