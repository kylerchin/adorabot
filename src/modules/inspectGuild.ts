import { MessageEmbed } from "discord.js";
import * as Discord from "discord.js"
import { isAuthorizedAdmin } from "./moderation";
import { cassandraclient } from "./cassandraclient";


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
const lookupexistingsubscriptionquery = 'SELECT * FROM adoramoderation.guildssubscribedtoautoban WHERE serverid = ?';

export async function inspectGuild(message,guildid,client) {
    var readExistingSubscriptionStatus: boolean = false;
    if (isAuthorizedAdmin(message.author.id)) {
        var guild = await getServer(guildid,client)
      
        await cassandraclient.execute(lookupexistingsubscriptionquery, [guildid]).then(fetchExistingSubscriptionResult => {
            //console.log(fetchExistingSubscriptionResult)
            if (fetchExistingSubscriptionResult.rows.length === 0) {
                //entry hasn't happened before
                readExistingSubscriptionStatus = false;
            }
            else {
                readExistingSubscriptionStatus = fetchExistingSubscriptionResult.rows[0].subscribed;
            }
        });
        
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