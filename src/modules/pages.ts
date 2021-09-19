export async function sendPages(channel,arrayOfPages,message,content) {
    var pageCounter = 0;
    await channel.send({
      "content": `${content}`,
      embeds: [arrayOfPages[pageCounter]]}).then(messageListEmbed => {

      //  message.channel.stopTyping();

        console.log("finished part 1")
    

            console.log("finished part 1")

          // Filters
          const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id
          const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id
          const deleteFilter = (reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id

          const timeOfTimer = 60*60*1000
          const backwards = messageListEmbed.createReactionCollector({filter: backwardsFilter, time: timeOfTimer})
          const forwards = messageListEmbed.createReactionCollector({filter: forwardsFilter, time: timeOfTimer})
          const deleteCollector = messageListEmbed.createReactionCollector({filter: deleteFilter, time: timeOfTimer})

          backwards.on('collect', (r, u) => {
              if (pageCounter === 0) {
                pageCounter = arrayOfPages.length-1
              } else {
                pageCounter--
              }
              messageListEmbed.edit({embeds: [arrayOfPages[pageCounter]]})
              r.users.remove(r.users.cache.filter(u => u === message.author).first())
          })

          forwards.on('collect', (r, u) => {
              if (pageCounter === arrayOfPages.length-1) {
                pageCounter = 0;
              } else {
                pageCounter++
              }
              messageListEmbed.edit({embeds: [arrayOfPages[pageCounter]]})
              r.users.remove(r.users.cache.filter(u => u === message.author).first())
          })

          deleteCollector.on('collect', (r, u) => {
            messageListEmbed.delete()
          })
          
          messageListEmbed.react('⬅').then( r => {
            messageListEmbed.react('➡').then( r => {
              messageListEmbed.react("🗑")
            })
          })

      })
}