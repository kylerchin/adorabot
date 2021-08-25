import {CommandInteraction, Message, MessageOptions} from 'discord.js'

export async function ping(message:Message,client) {

    const isDM: boolean = message.guild === null;
     // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const pingReturn = await message.reply("Ping?");

        var pingEmbedResponse:MessageOptions;

        if (isDM) {
          pingEmbedResponse = {
            "embeds": [{
              "description": `**펑!** If the Latency is significantly higher than the API Latency, the bot is likely ratelimited in this channel or guild.`,
              "fields": [
                {
                  "name": "Shard #",
                  "value": "DMs",
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
        } else {
          pingEmbedResponse = {
            "embeds": [{
              "description": `**펑!** If the Latency is significantly higher than the API Latency, the bot is likely ratelimited in this channel or guild.`,
              "fields": [
                {
                  "name": "Shard #",
                  "value": message.guild.shardId.toString(),
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
        }
        
        pingReturn.edit(pingEmbedResponse).catch();
}

export async function pingInteraction(interaction:CommandInteraction,client) {
  const timestampOfInteraction = interaction.createdTimestamp;

  const isDM: boolean = interaction.guild === null;
     // Calculates ping between sending a interaction and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        await interaction.reply("Ping?")
        
        
        await interaction.fetchReply().then(async pingReturn => {

          var pingEmbedResponse:MessageOptions;

        if (isDM) {
          pingEmbedResponse = {
            "embeds": [{
              "description": `**펑!** If the Latency is significantly higher than the API Latency, the bot is likely ratelimited in this channel or guild.`,
              "fields": [
                {
                  "name": "Shard #",
                  "value": "DMs",
                  "inline": true
                },
                {
                  "name": "Latency",
                  "value": `\`${pingReturn.createdTimestamp - timestampOfInteraction}ms\``,
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
        } else {
          pingEmbedResponse = {
            "embeds": [{
              "description": `**펑!** If the Latency is significantly higher than the API Latency, the bot is likely ratelimited in this channel or guild.`,
              "fields": [
                {
                  "name": "Shard #",
                  "value": interaction.guild.shardId.toString(),
                  "inline": true
                },
                {
                  "name": "Latency",
                  "value": `\`${pingReturn.createdTimestamp - timestampOfInteraction}ms\``,
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
        }
        
        interaction.followUp(pingEmbedResponse).catch();  

        })

        
}