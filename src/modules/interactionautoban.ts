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
                if (interaction.options.getSubcommand() === "help") {

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
            })
        
        
         
    } else {
        interaction.reply("Autoban only works in servers, please try again in a server you have admin privileges in.")
    }
}