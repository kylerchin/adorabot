export async function ping(message,client) {

    const isDM: boolean = message.guild === null;
     // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const pingReturn = await message.reply("Ping?");

        var pingEmbedResponse;

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
                  "value": message.guild.shardID.toString(),
                  "inline": "true"
                },
                {
                  "name": "Latency",
                  "value": `\`${pingReturn.createdTimestamp - message.createdTimestamp}ms\``,
                  "inline": "true"
                },
                {
                  "name": "API WebSocket Latency",
                  "value": `\`${Math.round(client.ws.ping)}ms\``,
                  "inline": "true"
                }
              ]
            }]
          }
        }
        
        pingReturn.edit(pingEmbedResponse).catch();
}