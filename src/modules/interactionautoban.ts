var _ = require('lodash');
var forEach = require("for-each")
// at the top of your file
const { canonicalize, getPrefixes } = require('webrisk-hash');
const TimeUuid = require('cassandra-driver').types.TimeUuid;
import { inspect, inspectservercmd } from './inspect';
import { logger } from './logger'
import { uniq } from './util'
import { Client, Message, Guild,Interaction, CommandInteraction } from 'discord.js'
import { cassandraclient } from './cassandraclient'
import { strikeBanHammer } from './strikeBanHammer'

import {lookuplocale} from './lookuptablelocale'
//let file = editJsonFile(`${__dirname}/config.json`);
//Generate time with TimeUuid.now();
const emptylinesregex = /\n/ig;

var unknownuserlocalarray: Array<any> = []

const userIDsRegex = /^(?:<@\D?)?(\d+)(?:>)?\s*,?\s*/;

const userReg = RegExp(/<@!?(\d+)>/);

export async function interactionautoban(interaction:CommandInteraction) {
    if (interaction.guild) {
        
        var subscribeStateToWrite: boolean;
        var isNewEntry: boolean;
        var firstchangedbyidfirststate;
        var firstchangedtimefirststate;
    //    var validToggleArgument: boolean = (args[0] === "yes" || args[0] === "no" || args[0] === "on" || args[0] === "off" || args[0] === "true" || args[0] === "false")

        var numberOfBannedUsersInDatabase;

        var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
        await cassandraclient.execute(lookuphowmanybannedusersquery)
            .then(async returnBanDatabaseAmount => {
                
                var readExistingSubscriptionStatus: boolean = false;
                var numberofrowsindatabase = returnBanDatabaseAmount.rows[0].count.low

                numberOfBannedUsersInDatabase = numberofrowsindatabase;

                if (interaction.guild != null) {
                    //check if server is registered
                    const lookupexistingsubscriptionquery = 'SELECT * FROM adoramoderation.guildssubscribedtoautoban WHERE serverid = ?';


                    await cassandraclient.execute(lookupexistingsubscriptionquery, [interaction.guild.id])
                        .then(fetchExistingSubscriptionResult => {
                            //console.log(fetchExistingSubscriptionResult)
                            if (fetchExistingSubscriptionResult.rows.length === 0) {
                                //entry hasn't happened before

                                isNewEntry = true;
                                firstchangedbyidfirststate = interaction.user.id;
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
                }

                //if argument is empty or if the first argument is not a valid toggle argument
                const autobansubcommand = interaction.options.getSubcommand()
               
                if (autobansubcommand === "help") {

                    var autobanstatustext: string;
                    if (readExistingSubscriptionStatus) {
                        autobanstatustext = "On"
                    } else {
                        autobanstatustext = "Off"
                    }

                    //show autoban help page
                    await interaction.reply({
                        "content": "Usage: `a!autoban on/off`",
                        "embeds": [{
                            "title": "Autoban Feature",
                            "image": {
                                "url": "https://user-images.githubusercontent.com/7539174/111216262-6ff4d300-8591-11eb-902c-a25e1595730c.png"
                            },
                            "description": "Automatically bans user accounts known for raiding, racism, lgbtq+phobia, disruption of servers based on ban list reports and blacklists.\nAdministrators can enable autoban by typing `a!autoban on` and disable new bans from happening via `a!autoban off`\nIf someone has been wrongly banned, please run `a!wrongfulban` to report this and we will investigate and unban.",
                            "fields": [
                                {
                                    "name": "Is Autoban On for this server?",
                                    "value": `${autobanstatustext}`
                                },
                                {
                                    "name": "# of bans in banlist",
                                    "value": `${numberOfBannedUsersInDatabase} and growing!`
                                }
                            ]
                        }]
                    })
                }

                if (interaction.member.permissions.has("ADMINISTRATOR")) {
                    if (autobansubcommand === "on" || autobansubcommand === "off") {


                        if (autobansubcommand === "on" ) {
                            subscribeStateToWrite = true
                        }
                        if (autobansubcommand === "off") {
                            subscribeStateToWrite = false
                        }

                        const query = 'INSERT INTO adoramoderation.guildssubscribedtoautoban (serverid, subscribed, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime) VALUES (?, ?, ?, ?, ?, ?)';
                        
                        var params;
                        
                        

                        if (isNewEntry) {
                            params = [interaction.guild.id, subscribeStateToWrite, interaction.user.id, firstchangedtimefirststate, firstchangedbyidfirststate, firstchangedtimefirststate];
                        } else {
                            params = [interaction.guild.id, subscribeStateToWrite, interaction.user.id, TimeUuid.now(), firstchangedbyidfirststate, firstchangedtimefirststate];
                        }

                         //console.log(params)
                         await cassandraclient.execute(query, params, { prepare: true }, function (err) {
                            console.log(err);
                            //Inserted in the cluster
                        });

                        if (subscribeStateToWrite === true) {
                            await interaction.reply(
                                {
                                    "embeds": [{
                                        "description": " ╭₊˚ʚ[🍰]ɞ・[This server is now subscribed to autobans!]\n╰₊˚ʚ[🍩]ɞ・[To turn it off, type `a!autoban off`] \` \n★ ⋆◗ ૪ 𖤩˖࣪ ◖ ִֶָ ໑ ָ࣪ ¡﹆:spider:ꔛ:candy:ෆ ✿:rabbit2::cherries:*◞:chains: ˊˎ -",
                                        "image": {
                                            "url": "https://user-images.githubusercontent.com/7539174/111216153-49369c80-8591-11eb-8eaf-0a0f13bf875c.png"
                                        }
                                    }]
                                }
                            ).catch()
                        } else {
                            await interaction.reply(
                                {
                                    "embeds": [{
                                        "description": " ╭₊˚ʚ[:herb:]ɞ・[This server is now unsubscribed to autobans!] \n ﹕˚₊  ❀ ꒱⋅** :warning: You're no longer protected from known raiders from entering your safe space :warning: ** ๑˚₊⊹ \n╰₊˚ʚ[:fish_cake:]ɞ・[To turn autoban back on, type `a!autoban on`] \` \n★ ⋆◗ ૪ 𖤩˖࣪ ◖ ִֶָ ໑ ָ࣪ ¡﹆:spider:ꔛ:candy:ෆ ✿:rabbit2::cherries:*◞:chains: ˊˎ -",
                                        "image": {
                                            "url": "https://user-images.githubusercontent.com/7539174/111224943-5b6a0800-859c-11eb-90bc-8806a51fd681.jpg"
                                        }
                                    }]
                                }
                            ).catch()
                        }
                    }
                } else {
                    interaction.channel.send("You don't have permission to toggle this feature. Only Administrators of the current guild can turn autoban on and off \n 𓆩 𓆪 ʾ ִֶָ%˓ ᵎ ҂ ࣪˖﹫𓂃⌁. ࣪˖")
                }
            })
        
        
         
    } else {
        interaction.reply("Autoban only works in servers, please try again in a server you have admin privileges in.")
    }
}