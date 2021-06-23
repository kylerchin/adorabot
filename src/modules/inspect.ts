import {uniq} from './util'
var _ = require('lodash');
var forEach = require("for-each")
const TimeUuid = require('cassandra-driver').types.TimeUuid;

interface inspectFunction {
    message: any;
    client: any;
    cassandraclient: any;
    [key:string]: any;
}

export function inspect(args:inspectFunction) {

        //transforms the user id list into a list to be banned
        //this line prevents accidental role mentions from being added
        var roleMentionsRemoved = args.message.content.replace(/<@&(\d{18})>/g, '')

        var arrayOfUserIdsToLookup = uniq(roleMentionsRemoved.match(/(?<!\d)\d{18}(?!\d)/g));


        forEach(arrayOfUserIdsToLookup, async function (individualUserId, key, array) {
              // inside a command, event listener, etc.
            var embed:any = {}
            var discordUser:any = {};

            embed.description = `Inspection of \`${individualUserId}\` completed.`
            _.set(embed, 'author.name', individualUserId)
            _.set(embed, 'fields[0].name',"Adora Global Banlist")

            await args.client.users.fetch(individualUserId, true, true).then(async (user) => {discordUser['user'] = user;
        }).catch((fetcherror) => {discordUser['error'] = fetcherror});

            await args.cassandraclient.execute("SELECT * FROM adoramoderation.banneduserlist WHERE banneduserid = ?", [individualUserId])
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
                            var timeOfBan = timeUuidLastChanged.getDate().toString();
                            _.set(embed, 'fields[0].value',"Banned: " + fetchExistingBanResult.rows[0].reason.trim() + "\nTime of ban: " + timeOfBan)
                        } else {
                            _.set(embed, 'fields[0].value',"Not Banned")
                        }
                        
                    }
                });

            if (discordUser.user) {
                //embed.thumbnail.url = await discordUser.user.displayAvatarURL();
                var avatarURL = await discordUser.user.displayAvatarURL();
                _.set(embed, 'thumbnail.url', avatarURL);
                _.set(embed, 'title', await discordUser.user.tag)
                _.set(embed, 'fields[1].name',"Account Created At")
                _.set(embed, 'fields[1].value',await discordUser.user.createdAt.toString())

                var avatarURLString = `\nAvatarURL: \`${avatarURL}\``

                embed.description = embed.description + avatarURLString;

                var flagsArray = await discordUser.user.flags.toArray()

                console.log(flagsArray)

                _.set(embed, 'fields[2].name',"Flags")
                if(flagsArray.length === 0) {
                    _.set(embed, 'fields[2].value', "No flags set.")
                } else {
                    _.set(embed, 'fields[2].value', flagsArray.join("\n"))
                }
                
            }

            if (discordUser.error) {
                console.log(discordUser.error)
                if (discordUser.error.code === 10013) {
                    _.set(embed, 'title', "Unknown user")
                }
            }

            console.log(discordUser.user)
            console.log(embed)
            args.message.channel.send({embeds: [embed]})
        });
}