import * as Discord from "discord.js"
import { isAuthorizedAdmin } from "./moderation";
import { cassandraclient } from "./cassandraclient";
import { logger } from "./logger";
const TimeUuid = require('cassandra-driver').types.TimeUuid;
import { Message, MessageEmbed,Util } from "discord.js"
import { sendPages } from "./pages";

function boolToEmoji(bool) {
    return (bool ? ':white_check_mark: ' : ':x:')
}

const getServer = async (guildID,client) => {
    // try to get guild from all the shards
    const req = await client.shard.broadcastEval((clientBroadcasted, contextParam) => {
        var guild = clientBroadcasted.guilds.cache.get(contextParam.guildid)
        var objToReturn = {
            name: guild.name,
            memberCount: guild.memberCount,
            verified: guild.verified,
            joinedTimestamp: guild.joinedTimestamp,
            isAdmin: guild.me.permissions.has('ADMINISTRATOR'),
            canBan: guild.me.permissions.has('BAN_MEMBERS')
        }
        if (guild.iconURL()) {
            objToReturn['iconurl'] = guild.iconURL({dynamic: true})
        }

        if (guild.bannerURL()) {
            objToReturn['bannerurl'] = guild.bannerURL({size: 4096})
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

export async function listAllGuilds(message,client) {
    const req = await client.shard.broadcastEval((clientBroadcasted, contextParam) => {
        var arrayOfGuilds = clientBroadcasted.guilds.cache.map((eachGuild) => {
            return {
                id: eachGuild.id,
                memberCount: eachGuild.memberCount,
                name: eachGuild.name
            }
        })
        return arrayOfGuilds;
    },
    {
        "context": {
           
        }
        
    });

    var merged = [].concat.apply([], req);

    //console.log(merged);

    //sort greatest to least member count
    var sortedGuildList = merged.sort((a,b) => (a.memberCount > b.memberCount) ? -1: 1)

    var arrayOfTextGuildsInString = sortedGuildList.map((eachGuild) => {
        return `\`${eachGuild.id}\` | \`${eachGuild.memberCount}\` ${Util.escapeMarkdown(eachGuild.name)}`
    })

    var arrayOfSplitStrings = Util.splitMessage(arrayOfTextGuildsInString.join("\n"))

    var arrayOfPages = arrayOfSplitStrings.map((string,n) => {return new Discord.MessageEmbed({"description": string,
        "footer": {
            "text": `Page ${n+1}/${arrayOfSplitStrings.length}`
        }
    })});

    await sendPages(message.channel,arrayOfPages,message,"Adora Guilds")
}

export async function listAllGuildsAndInsertAutoban(message,client) {
    const req = await client.shard.broadcastEval((clientBroadcasted, contextParam) => {
        var arrayOfGuilds = clientBroadcasted.guilds.cache.map((eachGuild) => {
            return {
                id: eachGuild.id,
                memberCount: eachGuild.memberCount,
                name: eachGuild.name
            }
        })
        return arrayOfGuilds;
    },
    {
        "context": {
           
        }
        
    });

    var merged = [].concat.apply([], req);

    merged.forEach(row => {
        //insert into cassandra
        cassandraclient.execute(
            "INSERT INTO adoramoderation.guildssubscribedtoautoban (serverid, subscribed, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime) VALUES (?,?,?,?,?,?)",
            [row.id, true, message.author.id, TimeUuid.now(), message.author.id, TimeUuid.now()],
            {prepare: true}
        )
            .then((result) => {
                console.log('inserted')
                console.log()
        }).catch(error => {console.log(error)})
    })

    //console.log(merged);

    //sort greatest to least member count
    var sortedGuildList = merged.sort((a,b) => (a.memberCount > b.memberCount) ? -1: 1)

    var arrayOfTextGuildsInString = sortedGuildList.map((eachGuild) => {
        return `\`${eachGuild.id}\` | \`${eachGuild.memberCount}\` ${Util.escapeMarkdown(eachGuild.name)}`
    })

    var arrayOfSplitStrings = Util.splitMessage(arrayOfTextGuildsInString.join("\n"))

    var arrayOfPages = arrayOfSplitStrings.map((string,n) => {return new Discord.MessageEmbed({"description": string,
        "footer": {
            "text": `Page ${n+1}/${arrayOfSplitStrings.length}`
        }
    })});

    await sendPages(message.channel,arrayOfPages,message,"Adora Guilds")
}

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
        
        var autobanstatustext: string;
                    if (readExistingSubscriptionStatus) {
                        autobanstatustext = "On"
                    } else {
                        autobanstatustext = "Off"
                    }

        if (guild === null) {
            message.reply("This guild can't be found.")
        } else {
            var guildEmbed:MessageEmbed = new Discord.MessageEmbed({
                "title": guild.name,
                "fields": [
                    {
                        "name": "Is Autoban On for this server?",
                        "value": `${boolToEmoji(readExistingSubscriptionStatus)}`
                    },
                    {
                        "name": "Member Count",
                        "value": `${guild.memberCount}`
                    },
                    {
                        "name": "Adora Join Time",
                        "value": `<t:${Math.round(guild.joinedTimestamp/1000)}:F>`
                    },
                    {
                        "name": "Adora Permissions",
                        "value": `Admin: ${boolToEmoji(guild.isAdmin)}\nBan: ${boolToEmoji(guild.canBan)}`
                    }
                ]
            });
    
            if (guild.iconurl) {
                guildEmbed.setThumbnail(`${guild.iconurl}`)
            }

            if (guild.bannerurl) {
                guildEmbed.setImage(`${guild.bannerurl}`)
            }
    
            message.reply({
                embeds: [
                    guildEmbed
                ]
            })
        }
    }
}

export async function banFromGuild(message,guildid,client,banid) {
    if (isAuthorizedAdmin(message.author.id)) {
        const req = await client.shard.broadcastEval((clientBroadcasted, contextParam) => {
            var guild = clientBroadcasted.guilds.cache.get(contextParam.guildid);
            return guild.bans.create(contextParam.banid).then(banInfo => `Banned ${banInfo.user?.tag ?? banInfo.tag ?? banInfo}`)
            .catch((error) => console.log(error));
            
        },
        {
            "context": {
                guildid: guildid,
                banid: banid
            }
            
        });

        message.reply(`${req}`)
    }
    
}



export async function turnOnAdorabanInGuild(message,guildid,client) {
  
    if (isAuthorizedAdmin(message.author.id)) {

        var subscribeStateToWrite: boolean;
        var isNewEntry: boolean;
        var firstchangedbyidfirststate;
        var firstchangedtimefirststate;
        //check if server is registered
        const lookupexistingsubscriptionquery = 'SELECT * FROM adoramoderation.guildssubscribedtoautoban WHERE serverid = ?';

        var readExistingSubscriptionStatus: boolean = false;

        await cassandraclient.execute(lookupexistingsubscriptionquery, [guildid])
            .then(fetchExistingSubscriptionResult => {
                //console.log(fetchExistingSubscriptionResult)
                if (fetchExistingSubscriptionResult.rows.length === 0) {
                    //entry hasn't happened before

                    isNewEntry = true;
                    firstchangedbyidfirststate = message.author.id;
                    firstchangedtimefirststate = TimeUuid.now();
                    readExistingSubscriptionStatus = false;
                }
                else {
                    isNewEntry = false;
                    firstchangedbyidfirststate = fetchExistingSubscriptionResult.rows[0].firstchangedbyid;
                    firstchangedtimefirststate = fetchExistingSubscriptionResult.rows[0].firstchangedtime;
                    readExistingSubscriptionStatus = fetchExistingSubscriptionResult.rows[0].subscribed;
                }
            });

            const query = 'INSERT INTO adoramoderation.guildssubscribedtoautoban (serverid, subscribed, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime) VALUES (?, ?, ?, ?, ?, ?)';
            var params;
            if (isNewEntry) {
                params = [guildid, true, message.author.id, firstchangedtimefirststate, firstchangedbyidfirststate, firstchangedtimefirststate];
            } else {
                params = [guildid, true, message.author.id, TimeUuid.now(), firstchangedbyidfirststate, firstchangedtimefirststate];
            }
            //console.log(params)
            await cassandraclient.execute(query, params).then((result) => {
                message.reply(`${guildid} has been subscribed to autoban!`)
               logger.discordInfoLogger.info(`${guildid} has been subscribed to autoban!`,{type: "subscribeToAutobanForced", cassandralog: result, })
            });
}}