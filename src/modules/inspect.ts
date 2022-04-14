import {uniq} from './util'
var _ = require('lodash');
var forEach = require("for-each")
const TimeUuid = require('cassandra-driver').types.TimeUuid;
import {logger} from './logger'
import  {Guild, Message} from 'discord.js'
import {cassandraclient} from './cassandraclient'
var _ = require('lodash');

interface inspectFunction {
    message: any;
    client: any;
    [key:string]: any;
}

export function inspect(args:inspectFunction) {
    
    logger.discordInfoLogger.info(`Inspect responding to ${args.message.id}`)

        if (args.message.content.match(/koretz/gi)) {
            args.message.reply("https://www.youtube.com/watch?v=62gb35Xk6fs")
        }

        //transforms the user id list into a list to be banned
        //this line prevents accidental role mentions from being added
        var roleMentionsRemoved = args.message.content.replace(/<@&(\d{18})>/g, '')

        var arrayOfUserIdsToLookup = uniq(roleMentionsRemoved.match(/(?<!\d)\d{18}(?!\d)/g));

        var embeds = []

       forEach(arrayOfUserIdsToLookup, async function (individualUserId, key, array) {
              // inside a command, event listener, etc.
            var embed:any = {}
            var discordUser:any = {};

            embed.description = ``
            _.set(embed, 'author.name', individualUserId)
            _.set(embed, 'fields[0].name',"Adora Global Banlist")

            await args.client.users.fetch(individualUserId, true, true).then(async (user) => {discordUser['user'] = user;
        }).catch((fetcherror) => {discordUser['error'] = fetcherror});

            await cassandraclient.execute("SELECT * FROM adoramoderation.banneduserlist WHERE banneduserid = ?", [individualUserId])
                .then(fetchExistingBanResult => {
                    console.log(fetchExistingBanResult.rows)
                    if (fetchExistingBanResult.rows.length === 0) {
                        //the id isnt in the database
                        discordUser["idInBanDatabase"] = false;
                        _.set(embed, 'fields[0].value',"Not in Database")
                    } else {
                        discordUser["idInBanDatabase"] = true;
                       
                        if(fetchExistingBanResult.rows[0].banned === true) {
                            //console.log(fetchExistingBanResult.rows[0].reason.lastchangedtime)
                            var timeUuidLastChanged =  new TimeUuid(fetchExistingBanResult.rows[0].reason.lastchangedtime)
                            var timeOfBan = `<t:${Math.round(timeUuidLastChanged.getDate().getTime()/ 1000)}:F>`
                            _.set(embed, 'fields[0].value',"Banned: " + fetchExistingBanResult.rows[0].reason.trim() + "\nTime of ban: " + timeOfBan)
                        } else {
                            _.set(embed, 'fields[0].value',"Not Banned")
                        }
                        
                    }
                });


                //Figure out number of common servers Adora has with the user id
         /*   const promises = [
                //For Every Shard
                args.client.shard.broadcastEval( (client, contextParam) => {
                //console.log(client)
                
                //for every guild on every shard
                client.guilds.cache.reduce((prev, guild) => {
                    console.log("line 63")

                    //find the user
                guild.members.fetch(contextParam.individualUserId).then(
                    //if the result comes back, add 1 to the user count
                    (resultOfMember) => {
                        prev +1
                    }
                ).catch()

              

                }, 0)},
                 {
                    
                        individualUserId: individualUserId
                    
                }
                )
            ]

            */

           // var serverInfos = await Promise.all(promises)
            //const numberOfServersUserIsIn = serverInfos[0].reduce((prev, eachBatchOfServer) => prev + eachBatchOfServer, 0);

            //_.set(embed, 'fields[1].name','Common Servers')
            //_.set(embed, 'fields[1].value',`${numberOfServersUserIsIn}`)

            if (discordUser.user) {
                //embed.thumbnail.url = await discordUser.user.displayAvatarURL();
                var avatarURL = await discordUser.user.displayAvatarURL({"dynamic": true});
                _.set(embed, 'thumbnail.url', avatarURL);
                _.set(embed, 'title', await discordUser.user.tag)
                _.set(embed, 'fields[1].name',"Account Created At")
                _.set(embed, 'fields[1].value', `<t:${Math.round(await discordUser.user.createdAt.getTime() / 1000)}:F>`)

                var avatarURLString = `\nAvatarURL: \`${avatarURL}\``

                embed.description = embed.description + avatarURLString;

                var flagsArray = await discordUser.user.flags.toArray()

                console.log(flagsArray)

                _.set(embed, 'fields[2].name',"Flags")
                _.set(embed, 'fields[2].inline',true)
                if(flagsArray.length === 0) {
                    _.set(embed, 'fields[2].value', "No flags set.")
                } else {
                    _.set(embed, 'fields[2].value', flagsArray.join("\n"))
                }

                _.set(embed, 'fields[3].name', "Bot")
                _.set(embed, 'fields[3].inline',true)
                if (discordUser.user.bot) {
                    _.set(embed, 'fields[3].value', "TRUE")
                } else {
                    _.set(embed, 'fields[3].value', "FALSE")
                }

                _.set(embed, 'fields[4].name', "Official Discord System user")
                _.set(embed, 'fields[4].inline',true)
                if (discordUser.user.systen) {
                    _.set(embed, 'fields[4].value', "TRUE")
                } else {
                    _.set(embed, 'fields[4].value', "FALSE")
                }
                
            } 

            if (discordUser.error) {
                console.log(discordUser.error)
                if (discordUser.error.code === 10013) {
                    _.set(embed, 'title', "Unknown user")
                    embed.description = "Unknown user"
                }
            }

            console.log(discordUser.user)
            console.log(embed)
            args.message.channel.send({embeds: [embed]})

           //embeds.push(embed)
        });

        /*
        const embedChunked = _.chunk(embeds, 10);

        embedChunked.forEach(async (item) => {
            await args.message.channel.send({embeds: item})
        })*/
}

interface inspectservertype {
    client: any;
    serverId: string;
}

export async function inspectserver(inspectserverargs: inspectservertype) {
    inspectserverargs.client.shard.broadcastEval((clientBroadcasted, contextParam) => {
        clientBroadcasted.guilds.fetch(contextParam.serverId).then((guild) => {
            console.log(guild)
            return {
                "id": guild.id,
                "name": guild.name,
                "memberCount": guild.memberCount,
                "ownerID": guild.ownerID
            }

        }).catch((error) => {
            console.error(error)
            return false})
    }, {
        serverId: inspectserverargs.serverId
    }).catch((err) => logger.discordInfoLogger.info(err))
}
export async function inspectservercmd(args: inspectFunction) {

    var roleMentionsRemoved = args.message.content.replace(/<@&(\d{18})>/g, '')

    var arrayOfServersToLookup = _.uniq(roleMentionsRemoved.match(/(?<!\d)\d{18}(?!\d)/g));

    var fetchesToMake = arrayOfServersToLookup.map((serverid) => {
        console.log(serverid)
        return inspectserver({client: args.client, serverId: serverid})
    });

    await Promise.all(fetchesToMake).then(results => {
        console.log(results)
        logger.discordInfoLogger.info(results)
    });
}