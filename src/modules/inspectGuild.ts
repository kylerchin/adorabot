import { MessageEmbed } from "discord.js";
import * as Discord from "discord.js"
import { isAuthorizedAdmin } from "./moderation";


const getServer = async (guildID,client) => {
    // try to get guild from all the shards
    const req = await client.shard.broadcastEval((clientBroadcasted, contextParam) => {
        var guild = clientBroadcasted.guilds.cache.get(contextParam.guildid)
        return {
            name: guild.name,
            iconurl: guild.iconURL()
        }
    },
    {
        "context": {
            guildid: guildID
        }
        
    });

    //uild or null if not found
    return req.find(res => !!res) || null;
}

export async function inspectGuild(message,guildid,client) {
    if (isAuthorizedAdmin(message.author.id)) {
        var guild = await getServer(guildid,client)
        if (guild === null) {
            message.reply("This guild can't be found.")
        } else {
            var guildEmbed:MessageEmbed = new Discord.MessageEmbed({
                "title": guild.name
            });
    
            if (guild.iconURL()) {
                guildEmbed.setThumbnail(`${guild.iconurl}`)
            }
    
            message.reply({
                embeds: [
                    guildEmbed
                ]
            })
        }
    }
}