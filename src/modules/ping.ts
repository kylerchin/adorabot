import {CommandInteraction, Message, MessageOptions} from 'discord.js'

import {lookuplocale} from './lookuptablelocale'

export async function ping(message:Message,client) {

    const isDM: boolean = message.guild === null;
     // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const pingReturn = await message.reply("Ping?");

        var pingEmbedResponse:MessageOptions;

          pingEmbedResponse = {
            "embeds": [{
              "description": `**펑!** If the Latency is significantly higher than the API Latency, the bot is likely ratelimited in this channel or guild.`,
              "fields": [
                {
                  "name": "Shard #",
                  "value": `${!(isDM) ? `${message.guild.shardId.toString()}` : 'DMs'}`,
                  "inline": true
                },
                {
                  "name": "Latency",
                  "value": `\`${pingReturn.createdTimestamp - message.createdTimestamp}ms\``,
                  "inline": true
                },
                {
                  "name": "API WebSocket Latency",
                  "value": `\`${Math.round(client.ws.ping)}ms\``,
                  "inline": true
                }
              ]
            }]
          }
        
        
        pingReturn.edit(pingEmbedResponse).catch();
}

export async function pingInteraction(interaction:CommandInteraction,client) {
  const timestampOfInteraction = interaction.createdTimestamp;

  const isDM: boolean = interaction.guild === null;
     // Calculates ping between sending a interaction and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        await interaction.reply("Ping?")
        
        
        await interaction.fetchReply().then(async (pingReturn:Message) => {

          var pingEmbedResponse:MessageOptions;

          pingEmbedResponse = {
            "embeds": [{
              "description": `${lookuplocale({locale: interaction.locale, key: "ping1"})}`,
              "fields": [
                {
                  "name": lookuplocale({locale: interaction.locale, key: "shardnum"}),
                  "value": `${!(isDM) ? `${interaction.guild.shardId.toString()}` : 'DMs'}`,
                  "inline": true
                },
                {
                  "name": lookuplocale({locale: interaction.locale, key: "latency"}),
                  "value": `\`${pingReturn.createdTimestamp - timestampOfInteraction}${lookuplocale({locale: interaction.locale, key: "ms"})}\``,
                  "inline": true
                },
                {
                  "name": lookuplocale({locale: interaction.locale, key: "wslatency"}),
                  "value": `\`${Math.round(client.ws.ping)}${lookuplocale({locale: interaction.locale, key: "ms"})}\``,
                  "inline": true
                }
              ]
            }]
          }
        
        interaction.followUp(pingEmbedResponse).catch();  

        })

        
}