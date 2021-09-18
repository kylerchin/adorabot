import { MessageEmbed } from "discord.js";
import * as Discord from "discord.js"
import { isAuthorizedAdmin } from "./moderation";


const getServer = async (guildID,client) => {
    // try to get guild from all the shards
    const req = await client.shard.broadcastEval((clientBroadcasted, contextParam) => {
        var guild = clientBroadcasted.guilds.cache.get(contextParam.guildid)
        var objToReturn = {
            name: guild.name
        }
        if (guild.iconURL()) {
            objToReturn['iconurl'] = guild.iconURL({dynamic: true})
        }
        return objToReturn;
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
    
            if (guild.iconurl) {
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