var _ = require('lodash');
var forEach = require("for-each")
// at the top of your file
const { canonicalize, getPrefixes } = require('webrisk-hash');
const TimeUuid = require('cassandra-driver').types.TimeUuid;
import editJsonFile = require("edit-json-file");
var importconfigfile = editJsonFile(`${__dirname}/../../config.json`);
import { inspect, inspectservercmd } from './inspect';
import { logger } from './logger'
import { uniq } from './util'
import { Client, Message, Guild } from 'discord.js'
import { cassandraclient } from './cassandraclient'
import { strikeBanHammer } from './strikeBanHammer'
//let file = editJsonFile(`${__dirname}/config.json`);
let fileOfBanTimeouts = editJsonFile(`${__dirname}/../../putgetbanstimeout.json`);
//Generate time with TimeUuid.now();
const emptylinesregex = /\n/ig;

var unknownuserlocalarray: Array<any> = []

const userIDsRegex = /^(?:<@\D?)?(\d+)(?:>)?\s*,?\s*/;

const userReg = RegExp(/<@!?(\d+)>/);

function prioritizeGuildBanAlgo(memberCount) {
    if (memberCount < 3) {
        return false;
    }

    if (memberCount > 20) {
        return true;
    } else {
        if (Math.random() < 0.1) {
            return true;
        } else {
            return false;
        }
    }
}

export async function kickAdoraOutOfServerId(serverId, client) {
    client.shard.broadcastEval((clientBroadcasted, contextParam) => {
        clientBroadcasted.guilds.fetch(contextParam.serverId)
            .then(guild => {
                guild.leave().then((guildleft) => {
                    //logger.discordInfoLogger.info(`Admin kicked Adora out of ${guildleft.name}`, {type: "adminTriggeredKickFromServer", guildleft: guildleft})
                    var infoToSendBack = { status: "successful", guildleft: guildleft }
                }).catch()

            })
            .catch();
    }, {
        "context": {
            serverId: serverId
        }
    }).then(results => {
        logger.discordInfoLogger.info(`Admin kicked Adora out of ${results.guildleft.name}`, { type: "adminTriggeredKickFromServer", guildleft: results.guildleft })
    })
        .catch((error) => logger.discordErrorLogger.error(error))
}

function arrayOfUserIdsFromMessage(message) {
    var roleMentionsRemoved = message.content.replace(/<@&(\d{18})>/g, '')


    // don't put in attachment links into the fuckin ban list
    var attachments = message.attachments
    var urlsInMessage = []

    var removedMessageAttachmentURLsFromContent = roleMentionsRemoved

    forEach(attachments, (attach) => {
        urlsInMessage.push(attach.url)
        removedMessageAttachmentURLsFromContent = removedMessageAttachmentURLsFromContent.replaceAll(attach.url, "")
    })
    //transforms the user id list into a list to be banned
    var arrayOfUserIdsToBan = _.uniq(removedMessageAttachmentURLsFromContent.match(/(?<!\d)\d{18}(?!\d)/g));

    var reasonForBanRegister = roleMentionsRemoved.replace(/(<@!?(\d+)>(,|\.|\ )*)/g, '').replace(/(?<!\d)\d{18}(?!\d)/g, '').replace(/(a!(\ )*ban(\ )*)/g, '').trim().replace(emptylinesregex, "")

    return { arrayOfIds: arrayOfUserIdsToBan, reason: reasonForBanRegister }
}

interface unbanSubArgsInterface {
    userid: string;
    reason: string;
    client: any;
}

export async function unBanOnAllAdoraSubbedServers(unbanSubArgs: unbanSubArgsInterface) {
    //for every server subscribed
    //fetch the ban list for the server

    //fetch the ban database
    //is each ban inside the database?
    //if not, ban them
    var currentShardServerIDArray = []

    await unbanSubArgs.client.guilds.cache.forEach(guild => {
        //console.log(`${guild.name} | ${guild.id}`);
        currentShardServerIDArray.push(guild.id)
        //console.log("guild.id " + guild.id)
    })

    //each shard fetch it's servers it's able to ban the user on
    var queryForMatchingServers = ('SELECT * FROM adoramoderation.guildssubscribedtoautoban WHERE serverid IN ? AND subscribed = ? ALLOW FILTERING;')

    var listOfQueriesToSendToScylla = []

    //For Every server in the array, transform it into a query to send to Cassandra
    await forEach(currentShardServerIDArray, async (eachServerIdItem) => {
        //console.log(eachServerIdItem)

        var serverIdArrayThing = []
        serverIdArrayThing.push(eachServerIdItem)

        var parametersServers = [serverIdArrayThing, true];

        listOfQueriesToSendToScylla.push(cassandraclient.execute(queryForMatchingServers, parametersServers, { prepare: true }))

    })

    //console.log(listOfQueriesToSendToScylla)

    //Run All the queries, then
    await Promise.all(listOfQueriesToSendToScylla).then(async function (values) {
        //console.log(values)

        //For Each server in the shard that is subscribed, run the ban database check
        forEach(values, async (matchingServerList) => {
            //console.log(matchingServerList.rows.length)

            //console.log(matchingServerList)
            //.rows.length === 0

            //for each server that the shard client is able to ban on...
            forEach(matchingServerList.rows, async function (eachServerThatIsSubscribed) {
                //console.log("serverid to work on" + eachServerThatIsSubscribed.serverid)
                var individualservertodoeachunban = await unbanSubArgs.client.guilds.cache.get(eachServerThatIsSubscribed.serverid);
                individualservertodoeachunban.members.unban(unbanSubArgs.userid, unbanSubArgs.reason)
                    .then((user) => async (user) => {
                        await logger.discordDebugLogger.debug(`Unbanned from Banlist ${user.username || user.id || user} from ${individualservertodoeachunban.name} for ${unbanSubArgs.reason}`, { userObject: user, unbanReason: unbanSubArgs.reason, individualservertodoeachunban: individualservertodoeachunban, type: "manualGlobalbanlistUnbanSuccessful" })
                    }).catch(error => logger.discordErrorLogger.error({ message: error, type: "banlistUnbanFailed" }))


            })


        })

        //now all bans have been completed
    });
}

export async function isAuthorizedAdmin(userid) {
    var isauthorizedtoaddbanstodatabase: boolean = false;

    var loadedConfigData = importconfigfile.get()

    /*  console.log(loadedConfigData) */

    forEach(loadedConfigData.config.allowedToBanUsers, function (value, key, array) {
        if (value.userid === userid) {
            isauthorizedtoaddbanstodatabase = true;
        } else {

        }
    });

    return isauthorizedtoaddbanstodatabase;
}

export async function banGuildMember(message, command, args) {
    //check if user trying to do the command has permissions

    var isPurgeBan: boolean;

    if (command === "ban") {
        isPurgeBan = false;
    } else {
        isPurgeBan = true;
    }

    if (command === "syncbanswiththisguild") {
        if (isAuthorizedAdmin(message.author.id)) {
            try {
                message.guild.bans.fetch()
                    .then((collectionOfBans) => {
                        console.log(collectionOfBans)
                    })
                    .catch(error => {
                        console.log(error)
                    })
            } catch (errorTry) {
                console.log(errorTry)
            }
        }


    }

    const isDM: boolean = message.guild === null;

    if (isDM) {
        message.channel.send("You can't ban users in DMs, this comamnd only applies to servers!")
    } else {
        if (message.member.permissions.has('BAN_MEMBERS') || isAuthorizedAdmin(message.author.id)) {
            //message.reply("You have the permission to ban!")

            //this line prevents accidental role mentions from being added
            var roleMentionsRemoved = message.content.replace(/<@&(\d{18})>/g, '')

            //transforms the user id list into a list to be banned
            var arrayOfUserIdsToBan = roleMentionsRemoved.match(/(?<!\d)\d{18}(?!\d)/g);
            //remove any duplicates from the array
            arrayOfUserIdsToBan = uniq(arrayOfUserIdsToBan)
            console.log(arrayOfUserIdsToBan)

            if (arrayOfUserIdsToBan.length === 0) {
                message.reply("The correct format is `a!ban (Mentions/UserIDs) [reason]")
            } else {
                if (arrayOfUserIdsToBan) {
                    message.channel.send(`Banning ${arrayOfUserIdsToBan.length} users.`)
                }

                var reasonForBanRegister = roleMentionsRemoved.replace(/(<@!?(\d+)>(,|\.|\ )*)/g, '').replace(/(?<!\d)\d{18}(?!\d)/g, '').replace(/(a!(\ )*ban(\ )*)/g, '').trim().replace(emptylinesregex, "")
                //apply the bans to the database
                message.channel.send(`Reason: ${reasonForBanRegister}`)

                var banOptionsObject: any;

                if (isPurgeBan) {
                    banOptionsObject = { days: 7, 'reason': reasonForBanRegister }
                } else {
                    banOptionsObject = { 'reason': reasonForBanRegister }
                }

                const arrayOfBanPromisesMapped = arrayOfUserIdsToBan.map(banID => message.guild.members.ban(banID, banOptionsObject));

                console.log(arrayOfBanPromisesMapped)

                Promise.all(arrayOfBanPromisesMapped).then(values => {
                    console.log(values); // [3, 1337, "foo"]
                    forEach(values, async (promisecontent) => {
                        console.log(promisecontent)
                        // logger.discordInfoLogger.info(`Banned ${user.username || user.id || user} from ${message.guild.name}`, { userObject: user })
                    })
                });
            }

        } else {
            message.reply("You do not have permission to ban users in this guild.")
        }
    }

}

export async function unbanGuildMember(message: Message) {
    //check if user trying to do the command has permissions

    const isDM: boolean = message.guild === null;

    if (isDM) {
        message.channel.send("You can't ban or unban users in DMs, this comamnd only applies to servers!")
    } else {
        if (message.member.permissions.has('BAN_MEMBERS') || isAuthorizedAdmin(message.author.id)) {
            //message.reply("You have the permission to ban!")

            //this line prevents accidental role mentions from being added
            var roleMentionsRemoved = message.content.replace(/<@&(\d{18})>/g, '')

            //transforms the user id list into a list to be banned
            var arrayOfUserIdsToBan = uniq(roleMentionsRemoved.match(/(?<!\d)\d{18}(?!\d)/g));

            if (arrayOfUserIdsToBan.length === 0) {
                message.reply("The correct format is `a!unban (Mentions/UserIDs) [reason]")
            } else {
                if (arrayOfUserIdsToBan) {
                    await message.channel.send(`Unbanning ${arrayOfUserIdsToBan.length} users.`)
                }

                var reasonForBanRegister = roleMentionsRemoved.replace(/(<@!?(\d+)>(,|\.|\ )*)/g, '').replace(/(?<!\d)\d{18}(?!\d)/g, '').replace(/(a!(\ )*unban(\ )*)/g, '').trim().replace(emptylinesregex, "")
                //apply the bans to the database
                await message.channel.send(`Reason: ${reasonForBanRegister}`)

                await forEach(arrayOfUserIdsToBan, async (banID) => {
                    /* console.log(banID)*/
                    await message.guild.members.unban(banID, reasonForBanRegister)
                        .then(async (user) => {
                            await logger.discordDebugLogger.debug(`Unbanned ${user.username || user.id || user} from ${message.guild.name}`, { userObject: user }).catch()
                        }
                        )
                        .catch(error => {
                            message.channel.send(`Failed to unban ${banID}`)
                        });
                })
            }

        } else {
            message.reply("You do not have permission to ban users in this guild.")
        }
    }

}

export async function howManyUsersInBanDatabase() {
    var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
    await cassandraclient.execute(lookuphowmanybannedusersquery)
        .then(async returnBanDatabaseAmount => {
            var numberofrowsindatabase = await returnBanDatabaseAmount.rows[0].count.low
            /* console.log(typeof numberofrowsindatabase + numberofrowsindatabase) */
            return numberofrowsindatabase;
        })
}

export async function processAllModerationCommands(message, command, args, config, client) {

    const isDM: boolean = message.guild === null;

    if (command === "ban" || command === 'banpurge' || command === "purgeban") {
        await banGuildMember(message, command, args)
        /*await message.reply({
            "embed": {
                "description": "Are you banning someone because they are raiding, putting NSFW, etc?\n" +
                    "Please help protect other servers by reporting it! " +
                    " \n Step 1: Join the Adorabot support server https://discord.gg/Dgvm3kt .\nStep 2: Add the UserIDs of the offending users and detailed evidence such as screenshots and logs in the #reporting-station channel. \n Step 3: Adora's moderation team will ban that user across all of adora's servers."
            }
        })*/
    }

    if (command === "unban") {
        await unbanGuildMember(message)
    }

    if (command === "mooooocowwwww") {
        message.reply(`${__dirname}`)
    }

    if (command === "inspectuser" || command === 'inspect') {
        inspect({ message, client })
    }

    if (command === 'inspectserver' || command === 'inspectguild') {
        inspectservercmd({ message, client, cassandraclient })
    }

    if (command === "adoraunban") {
        if (isAuthorizedAdmin(message.author.id)) {
            message.reply(":unlock: You are authorized :unlock: ")

            var resultsFromUserId = arrayOfUserIdsFromMessage(message)

            forEach(resultsFromUserId.arrayOfIds, function (userid) {
                client.shard.broadcastEval((client, context) => client.unBanOnAllAdoraSubbedServers({ "userid": context.userid, "reason": context.reason }),
                    {
                        "context": {
                            "userid": userid,
                            "reason": resultsFromUserId.reason
                        }
                    })
            })

            message.reply(`Unbanned ${resultsFromUserId.arrayOfIds.length} from all subscribed servers`)

            //remove the entry from the database
            const queryToRemoveFromDatabase = "DELETE FROM adoramoderation.banneduserlist WHERE banneduserid = ?"

            forEach(resultsFromUserId.arrayOfIds, function (userid) {
                const parametersToRemoveFromDatabase = [userid]

                cassandraclient.execute(queryToRemoveFromDatabase, parametersToRemoveFromDatabase, { prepare: true })
                    .then(results => {
                        logger.discordInfoLogger.info(`Removed ${userid} from banlist database`, { type: "deleteFromBanlist", userid: userid })
                    }).catch(
                        (cassandraerror) => logger.discordErrorLogger.error(cassandraerror, { type: "cassandraerrorDeleteFromBanList" })
                    )
            })

            message.reply(`Removed ${resultsFromUserId.arrayOfIds.length} entries from global banlist database`)

        }
    }

    if (command === "adorakickoutofserver") {
        if (isAuthorizedAdmin(message.author.id)) {
            message.reply(":unlock: You are authorized :unlock: ")

            var arrayOfUserIdsToBan = uniq(message.content.match(/(?<!\d)\d{18}(?!\d)/g));

            forEach(arrayOfUserIdsToBan, function (serverId) {
                kickAdoraOutOfServerId(serverId, client)
            })

            message.reply(`Removed ${arrayOfUserIdsToBan.length} server(s) from Adora's system`)

        }
    }

    if (command === "updatebans") {

        var isauthorizedtoaddbanstodatabase: boolean = false;

        var loadedConfigData = importconfigfile.get()

        /*  console.log(loadedConfigData) */

        forEach(loadedConfigData.config.allowedToBanUsers, function (value, key, array) {
            if (value.userid === message.author.id) {
                isauthorizedtoaddbanstodatabase = true;
            } else {

            }
        });

        if (isauthorizedtoaddbanstodatabase) {
            await message.channel.send(":unlock: You are authorized :unlock: ")
            await message.channel.send("Forcing Updating Ban List on All Guilds on All Shards")
            await message.channel.send("Syntax: `a!updatebans` to run without unknown user check, \n `a!updatebans recheck` to recheck all previously marked unkown users")
            await message.channel.send("a!adoraban and a!autoban will also trigger this command automatically, so there's no need to run this after")

            if (args[0] === "recheck") {
                await message.channel.send("Running with unknown user recheck...")
                await client.shard.broadcastEval(client => client.everyServerRecheckBansOnThisShardWithUnknownBans())
            } else {
                await message.channel.send("Running without unknown user recheck...")
                await client.shard.broadcastEval(client => client.everyServerRecheckBansOnThisShard())
            }
            //await message.reply("Finished!")
        }
    }

    if (command === "currentinfo") {
        message.reply({
            embeds: [{
                "fields": [
                    {
                        "name": "Message ID",
                        "value": `\`${message.id}\``
                    },
                    {
                        "name": "Message Channel ID",
                        "value": `\`${message.channel.id}\``
                    },
                    {
                        "name": "Message Guild ID",
                        "value": `\`${message.guild.id}\``
                    },
                ]
            }]
        })
    }


    if (command === "adorabadlink" || command === "adorabadlinks") {
        if (isAuthorizedAdmin(message.author.id)) {
            message.reply(`:unlock: You are authorized to run adorabadlink`)
            //message.reply(message.content)
            var arrayOfUrls = message.content.match(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm)

            if (arrayOfUrls === null) {
                message.reply(`No Urls Found. Please insert urls seperated by spaces.`)
            } else {
                var arrayOfUrlsCleaned = arrayOfUrls.map(link => canonicalize(link).replace(/https:\/\//, "").replace(/http:\/\//, ""))

                arrayOfUrlsCleaned.forEach(async (url) => {
                    const query = 'INSERT INTO adoramoderation.badlinks (link, type, addedbyid, addtime) VALUES (?, ?, ?, ?)';
                    var params;
                    params = [url, "discordphishing", message.author.id, TimeUuid.now()];

                    await cassandraclient.execute(query, params, { prepare: true }, await function (err) {
                        console.log(err);
                        //Inserted in the cluster
                    });
                })

                message.reply(`Added ${arrayOfUrls.length} to the badlinks database.`)
            }

        }
    }

    if (command === "adoraban") {

        var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
        await cassandraclient.execute(lookuphowmanybannedusersquery)
            .then(async returnBanDatabaseAmount => {
                var initialnumberofrowsindatabase = returnBanDatabaseAmount.rows[0].count.low

                var isauthorizedtoaddbanstodatabase: boolean = false;

                var loadedConfigData = importconfigfile.get()

                /*        console.log(loadedConfigData) */

                forEach(loadedConfigData.config.allowedToBanUsers, function (value, key, array) {
                    if (value.userid === message.author.id) {
                        isauthorizedtoaddbanstodatabase = true;
                    } else {

                    }
                });

                if (isauthorizedtoaddbanstodatabase) {
                    await message.reply(":unlock: You are authorized :unlock: ")
                    //split message into list of userids and reason

                    //this line prevents accidental role mentions from being added
                    var roleMentionsRemoved = message.content.replace(/<@&(\d{18})>/g, '')


                    // don't put in attachment links into the fuckin ban list
                    var attachments = message.attachments
                    var urlsInMessage = []

                    var removedMessageAttachmentURLsFromContent = roleMentionsRemoved

                    forEach(attachments, (attach) => {
                        urlsInMessage.push(attach.url)
                        removedMessageAttachmentURLsFromContent = removedMessageAttachmentURLsFromContent.replaceAll(attach.url, "")
                    })
                    //transforms the user id list into a list to be banned
                    var arrayOfUserIdsToBan = uniq(removedMessageAttachmentURLsFromContent.match(/(?<!\d)\d{18}(?!\d)/g));

                    var reasonForBanRegister = roleMentionsRemoved.replace(/(<@!?(\d+)>(,|\.|\ )*)/g, '').replace(/(?<!\d)\d{18}(?!\d)/g, '').replace(/(a!(\ )*adoraban(\ )*)/g, '').trim().replace(emptylinesregex, "")
                    //apply the bans to the database
                    await message.channel.send(`Reason: ${reasonForBanRegister}`)

                    forEach(arrayOfUserIdsToBan, async function (individualUserIdToAddToBanDatabase, keyBan, arrayBan) {
                        //write bans to adoramoderation.banneduserlist
                        //banneduserid text PRIMARY KEY, banned boolean, reason text, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid);

                        const lookupexistingbanquery = 'SELECT * FROM adoramoderation.banneduserlist WHERE banneduserid = ?';

                        var isBanRecordNew: boolean;
                        var banFirstChangedByIdInitialState;
                        var banFirstChangedTimeInitialState;

                        //lookup each user id in cassandra
                        await cassandraclient.execute(lookupexistingbanquery, [individualUserIdToAddToBanDatabase])
                            .then(fetchExistingBanResult => {

                                //is there a record matching it?
                                if (fetchExistingBanResult.rows.length === 0) {
                                    //entry hasn't happened before
                                    /* console.log("new ban entry") */
                                    isBanRecordNew = true;
                                    banFirstChangedByIdInitialState = message.author.id;
                                    banFirstChangedTimeInitialState = TimeUuid.now();
                                } else {
                                    /* console.log("not a new entry, existing record found") */
                                    isBanRecordNew = false;
                                    banFirstChangedByIdInitialState = fetchExistingBanResult.rows[0].firstchangedbyid;
                                    banFirstChangedTimeInitialState = fetchExistingBanResult.rows[0].firstchangedtime;
                                }

                            })

                        const query = 'INSERT INTO adoramoderation.banneduserlist (banneduserid, banned, reason, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime) VALUES (?, ?, ?, ?, ?, ?, ?)';
                        var params;
                        if (isBanRecordNew) {
                            params = [individualUserIdToAddToBanDatabase, true, reasonForBanRegister, banFirstChangedByIdInitialState, banFirstChangedTimeInitialState, banFirstChangedByIdInitialState, banFirstChangedTimeInitialState];
                        } else {
                            params = [individualUserIdToAddToBanDatabase, true, reasonForBanRegister, message.author.id, TimeUuid.now(), firstchangedbyidfirststate, firstchangedtimefirststate];
                        }

                        await cassandraclient.execute(query, params, { prepare: true }, await function (err) {
                            console.log(err);
                            //Inserted in the cluster
                        });

                        //now update every server
                        //await runBanStream(cassandraclient, client)

                        //instruct every server to run the ban stream
                        await client.shard.broadcastEval(client => client.everyServerRecheckBansOnThisShard())
                        //await everyServerRecheckBans(cassandraclient,client)
                    })

                    await cassandraclient.execute(lookuphowmanybannedusersquery)
                        .then(async returnAfterBanDatabaseAmount => {
                            var afternumberofrowsindatabase = returnAfterBanDatabaseAmount.rows[0].count.low

                            var messageToSendToChannelForConfirmation = `${initialnumberofrowsindatabase} initial rows\n${afternumberofrowsindatabase} after rows\n :white_check_mark: operation completed`

                            if (arrayOfUserIdsToBan) {
                                messageToSendToChannelForConfirmation = `Banning ${arrayOfUserIdsToBan.length} users.\n` + messageToSendToChannelForConfirmation
                            }

                            message.channel.send(messageToSendToChannelForConfirmation)
                        });
                } else {
                    message.reply(":closed_lock_with_key:  You don't have permission to do that! :closed_lock_with_key: ")
                }

            })




    }

    if (command === "wrongfulban") {
        message.reply("We apologize for the wrongful ban. We make mistakes as we import data from other banlist databases from other servers. Please fill out the form at https://forms.gle/V3QKNg3Vyi4P4CK7A so we can investigate this and unban you.").catch()
    }

    if (command === "syncbans" || command === "bansync" || command === "banssync") {
        if ((!isDM)) {
            if (message.member.permissions.has("ADMINISTRATOR")) {

                message.reply({
                    "embeds": [{
                        "title": "Ban Sync Starting",
                        "description": "This will match your server's ban list manually with Adora's ban database.",
                        "footer": {
                            "text": "I hope you're drinking enough water and taking care of yourself! Eat and go to sleep on time and be mindful!"
                        },

                        "fields": [
                            {
                                "name": "Don't wanna do this? Automate it!",
                                "value": "Wanna automate this? Enable autoban by typing `a!autoban on`. When bans are automatically added by Adora's moderators, the bans will be automatically matched without you having to run any commands!"
                            }
                        ]
                    }]
                })

                if (message.guild.me.permissions.has("BAN_MEMBERS")) {

                } else {
                    message.reply("Adorabot needs BAN_MEMBERS permissions for this to work! \nPlease turn on Administrator in `Server Settings > Roles > Adora > Permissions > Administrator` and slide the switch for Administrator to the right.")
                        .catch()
                }

                var individualservertodoeachban = message.guild

                var numberOfSuccessfulBansOnThisOperation = 0

                var queryForBanList = "SELECT * FROM adoramoderation.banneduserlist WHERE banned = ? ALLOW FILTERING;"
                var parametersForBanList = [true];

                await cassandraclient.execute(queryForBanList, parametersForBanList)
                    .then(globallistOfBannableUsers => {
                        if (message.guild.available) {
                            message.guild.fetchBans().then((fetchBanDatabase) => {
                                //check if list of users has the user that we want to ban
                                forEach(globallistOfBannableUsers.rows, function (eachBannableUserRow) {
                                    var isUserBannedFromThisGuild = fetchBanDatabase.has(eachBannableUserRow.banneduserid)
                                    //  console.log(`is ${eachBannableUserRow.banneduserid} banned from ${individualservertodoeachban}: ${isUserBannedFromThisGuild}`)

                                    if (isUserBannedFromThisGuild) {
                                        //this user is already fuckin banned
                                    }
                                    else {

                                        if (eachBannableUserRow.unknownuser === true) {
                                            //unknown user, do absolutely fucking nothing
                                        } else {
                                            //THE BAN HAMMER STRIKES!

                                            var toBanReason: string;
                                            if (!eachBannableUserRow.reason || eachBannableUserRow.reason.length == 0) {
                                                toBanReason = "Banned by Adora's Automagical system via manual sync!"
                                            } else {
                                                toBanReason = `${eachBannableUserRow.reason} | Banned by Adora's Automagical system via manual sync!`
                                            }

                                            //trim the reason text to 512 char just in case it fails because the reason is too long
                                            toBanReason = toBanReason.substring(0, 511)
                                            if (individualservertodoeachban.available) {
                                                individualservertodoeachban.members.ban(eachBannableUserRow.banneduserid, { 'days': 7, 'reason': toBanReason })
                                                    .then((user) => {
                                                        numberOfSuccessfulBansOnThisOperation = numberOfSuccessfulBansOnThisOperation + 1;
                                                        logger.discordDebugLogger.debug({ message: `Banned ${user.username || user.id || user} from ${individualservertodoeachban.name}`, userObject: user })
                                                    })
                                                    .catch(async (error) => {
                                                        await logger.discordWarnLogger.warn({
                                                            type: "banCheckerFailed",
                                                            error: error
                                                        })

                                                        if (error.code === 10013) {
                                                            //this user is unknown
                                                            var queryForUnknownUser = "INSERT INTO adoramoderation.banneduserlist (banneduserid, banned, reason, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime, unknownuser) VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
                                                            var paramsForUnknownUser = [eachBannableUserRow.banneduserid,
                                                            eachBannableUserRow.banned,
                                                            eachBannableUserRow.reason,
                                                            eachBannableUserRow.lastchangedbyid,
                                                            eachBannableUserRow.lastchangedtime,
                                                            eachBannableUserRow.firstchangedbyid,
                                                            eachBannableUserRow.firstchangedtime,
                                                                true]
                                                            await cassandraclient.execute(queryForUnknownUser, paramsForUnknownUser)
                                                                .then(async (cassandrclientmarkunknown) => {
                                                                    await logger.discordDebugLogger.debug(`Marked ${eachBannableUserRow.banneduserid} as unknown`, { type: cassandraclient, result: cassandrclientmarkunknown })
                                                                })
                                                                .catch();
                                                        }
                                                    });
                                            }

                                        }

                                    }
                                })

                                //ban process as finished, tell the user we're done.
                                //message.channel.send(`✅ The manual ban sync has completed!✅ \n ✅ ${numberOfSuccessfulBansOnThisOperation} bans added successfully ✅`).catch()
                            }).catch()
                        }


                    })

            }
        }
    }

    if (command === "autoban") {

        var subscribeStateToWrite: boolean;
        var isNewEntry: boolean;
        var firstchangedbyidfirststate;
        var firstchangedtimefirststate;
        var validToggleArgument: boolean = (args[0] === "yes" || args[0] === "no" || args[0] === "on" || args[0] === "off" || args[0] === "true" || args[0] === "false")

        var numberOfBannedUsersInDatabase;

        var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
        await cassandraclient.execute(lookuphowmanybannedusersquery)
            .then(async returnBanDatabaseAmount => {
                var numberofrowsindatabase = returnBanDatabaseAmount.rows[0].count.low

                numberOfBannedUsersInDatabase = numberofrowsindatabase;

                if (!isDM) {
                    //check if server is registered
                    const lookupexistingsubscriptionquery = 'SELECT * FROM adoramoderation.guildssubscribedtoautoban WHERE serverid = ?';

                    var readExistingSubscriptionStatus: boolean = false;

                    await cassandraclient.execute(lookupexistingsubscriptionquery, [message.guild.id])
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
                }

                //if argument is empty or if the first argument is not a valid toggle argument
                if ((!validToggleArgument)) {

                    var autobanstatustext: string;
                    if (readExistingSubscriptionStatus) {
                        autobanstatustext = "On"
                    } else {
                        autobanstatustext = "Off"
                    }

                    //show autoban help page
                    await message.reply({
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

                if ((!isDM)) {

                    //also allow adorabot admins to change this
                    var isauthorizedtoaddbanstodatabase: boolean = false;

                    var loadedConfigData = importconfigfile.get()

                    /*  console.log(loadedConfigData) */

                    forEach(loadedConfigData.config.allowedToBanUsers, function (value, key, array) {
                        if (value.userid === message.author.id) {
                            isauthorizedtoaddbanstodatabase = true;
                        } else {

                        }
                    });

                    //is the user sending this command either an admin of the server or an admin of the Adorabot system?
                    if (message.member.permissions.has("ADMINISTRATOR") || isauthorizedtoaddbanstodatabase) {
                        //has permissions
                        if (args[0] === "yes" || args[0] === "on" || args[0] === "true") {
                            var subscribeStateToWrite = true
                        }
                        if (args[0] === "no" || args[0] === "off" || args[0] === "false") {
                            var subscribeStateToWrite = false
                        }
                        //validToggleArgument
                        //register server in database
                        if (validToggleArgument) {
                            const query = 'INSERT INTO adoramoderation.guildssubscribedtoautoban (serverid, subscribed, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime) VALUES (?, ?, ?, ?, ?, ?)';
                            var params;
                            if (isNewEntry) {
                                params = [message.guild.id, subscribeStateToWrite, message.author.id, firstchangedtimefirststate, firstchangedbyidfirststate, firstchangedtimefirststate];
                            } else {
                                params = [message.guild.id, subscribeStateToWrite, message.author.id, TimeUuid.now(), firstchangedbyidfirststate, firstchangedtimefirststate];
                            }
                            //console.log(params)
                            await cassandraclient.execute(query, params, { prepare: true }, function (err) {
                                console.log(err);
                                //Inserted in the cluster
                            });
                            if (subscribeStateToWrite === true) {
                                await message.reply(
                                    {
                                        "embeds": [{
                                            "description": " ╭₊˚ʚ[🍰]ɞ・[This server is now subscribed to autobans!]\n╰₊˚ʚ[🍩]ɞ・[To turn it off, type `a!autoban off`] \` \n★ ⋆◗ ૪ 𖤩˖࣪ ◖ ִֶָ ໑ ָ࣪ ¡﹆:spider:ꔛ:candy:ෆ ✿:rabbit2::cherries:*◞:chains: ˊˎ -",
                                            "image": {
                                                "url": "https://user-images.githubusercontent.com/7539174/111216153-49369c80-8591-11eb-8eaf-0a0f13bf875c.png"
                                            }
                                        }]
                                    }
                                ).catch()

                                if (message.guild.me.permissions.has("BAN_MEMBERS")) {

                                } else {
                                    message.reply("Adorabot needs BAN_MEMBERS permissions for this to work! \nPlease turn on Administrator in `Server Settings > Roles > Adora > Permissions > Administrator` and slide the switch for Administrator to the right.")
                                        .catch()
                                }



                            } else {
                                if (subscribeStateToWrite === false) {
                                    //await message.reply("This server is now unsubscribed to autobans! To turn autoban back on, type `a!autoban on`")
                                    await message.reply(
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
                        }

                    }
                    else {
                        await message.reply("You don't have permission to toggle this feature. Only Administrators of the current guild can turn autoban on and off \n 𓆩 𓆪 ʾ ִֶָ%˓ ᵎ ҂ ࣪˖﹫𓂃⌁. ࣪˖");
                    }
                }
                else {
                    await message.reply("You are accessing this command in a DM. Only Administrators of the current guild can turn autoban on and off");
                }
            })

        await client.shard.broadcastEval(client => client.everyServerRecheckBansOnThisShard())
    }
}

export async function everyServerRecheckBans(cassandraclient, client, recheckUnkownBan) {
    //for every server subscribed
    //fetch the ban list for the server

    //fetch the ban database
    //is each ban inside the database?
    //if not, ban them
    var currentShardServerIDArray = []

    await client.guilds.cache.forEach(guild => {
      //  console.log(`${guild.name} | ${guild.id}`);
        if (guild.available) {
            //ensure adora has these permissions
            console.log('guild avaliable')
            if (guild.me.permissions.has("BAN_MEMBERS")) {
                console.log('has perms to ban')
               currentShardServerIDArray.push(guild.id)
            }

        }
        //console.log("guild.id " + guild.id)
    })

    //shuffle guild list
    currentShardServerIDArray = _.shuffle(currentShardServerIDArray);

    console.log('server id list length: ' + currentShardServerIDArray.length)


    var queryForBanList = "SELECT * FROM adoramoderation.banneduserlist WHERE banned = ? ALLOW FILTERING;"
    var parametersForBanList = [true];
    var globallistOfBannableUsers
    //fetch the ban database
    await cassandraclient.execute(queryForBanList, parametersForBanList, { prepare: true })
        .then(listOfBannableUsers => {
            globallistOfBannableUsers = listOfBannableUsers;
        })

    console.log('ban database fetched')

    //each shard fetch it's servers it's able to ban the user on
    var queryForMatchingServers = ('SELECT * FROM adoramoderation.guildssubscribedtoautoban WHERE serverid IN ? AND subscribed = ? ALLOW FILTERING;')

    var listOfQueriesToSendToScylla = []

    //For Every server in the array, transform it into a query to send to Cassandra
    await forEach(currentShardServerIDArray, async (eachServerIdItem) => {
        //console.log(eachServerIdItem)

        var serverIdArrayThing = []
        serverIdArrayThing.push(eachServerIdItem)

        var parametersServers = [serverIdArrayThing, true];

        listOfQueriesToSendToScylla.push(cassandraclient.execute(queryForMatchingServers, parametersServers, { prepare: true }))

    })

    //console.log(listOfQueriesToSendToScylla)

    
    var howManyBansHaveBeenSubmittedSoFar = 0;


    //Run All the queries, then
    await Promise.all(listOfQueriesToSendToScylla).then(async function (values) {
        //console.log(values)

        //For Each server in the shard that is subscribed, run the ban database check
        forEach(values, async (matchingServerList) => {
            //console.log(matchingServerList.rows.length)

            //console.log(matchingServerList)
            //.rows.length === 0

            //for each server that the shard client is able to ban on...
            forEach(matchingServerList.rows, async function (eachServerThatIsSubscribed) {

                //console.log("serverid to work on" + eachServerThatIsSubscribed.serverid)
                var individualservertodoeachban = await client.guilds.cache.get(eachServerThatIsSubscribed.serverid);

                //console.log(individualservertodoeachban)

                // var listofusersbannedinindividualserver = await individualservertodoeachban.bans.fetch();
                await cassandraclient.execute("SELECT * FROM adoramoderation.completedbans WHERE guildid = ?", [individualservertodoeachban.id], { prepare: true })
                    .then(async (listOfUsersRaw) => {
                        const listofusersbannedinindividualserver = listOfUsersRaw.rows.map((eachRow) => eachRow.userid);
                    //    console.log('listofusersbannedinindividualserver',listofusersbannedinindividualserver)
                        //check if list of users has the user that we want to ban
                        forEach(globallistOfBannableUsers.rows, async function (eachBannableUserRow) {
                            var isUserBannedFromThisGuild = listofusersbannedinindividualserver.includes(eachBannableUserRow.baneduserid)
                           //  console.log(`is ${eachBannableUserRow.banneduserid} banned from ${individualservertodoeachban}: ${isUserBannedFromThisGuild}`)

                            if (isUserBannedFromThisGuild) {
                                //this user is already banned
                            }
                            else {

                                if (eachBannableUserRow.unknownuser === true && recheckUnkownBan === false) {
                                    //unknown user, do absolutely nothing
                                } else {
                                    //THE BAN HAMMER STRIKES!
                                //console.log('cassandra check not unknown user step 2')

                                    var toBanReason: string;
                                    if (!eachBannableUserRow.reason || eachBannableUserRow.reason.length == 0) {
                                        toBanReason = "Banned by Adora's Automagical system!"
                                    } else {
                                        toBanReason = `${eachBannableUserRow.reason} | Banned by Adora's Automagical system!`
                                    }

                                    //trim the reason text to 512 char just in case it fails because the reason is too long
                                    toBanReason = toBanReason.substring(0, 511)

                                    //if the cache of unknown users includes that banned user, don't do anything
                                    if (unknownuserlocalarray.includes(eachBannableUserRow.banneduserid)) { }
                                    else {
                                      //  console.log('step 3')
                                        //always check if the guild is avaliable before doing this
                                        if (individualservertodoeachban.available) {
                                        //    console.log('step 4: server available')
                                            if (true) {
                                          //      console.log('step 5, pass algo')

                                                                                    
                                                var loadedConfigData = importconfigfile.get()


                                                var timeoutAmount = loadedConfigData.config.banfreq * (howManyBansHaveBeenSubmittedSoFar + 1)

                                                //  console.log(`the current timeout amount is: ${timeoutAmount}`)
                                   
                                                if (timeoutAmount < 1000 * 60 * 60 * 24) {                    
                                                    setTimeout(async () => {
                                                        //PUT STRIKE HERE
                                                        console.log('ban the user pre')
                                                        strikeBanHammer(
                                                            {
                                                                individualservertodoeachban,
                                                                eachBannableUserRow,
                                                                unknownuserlocalarray,
                                                                toBanReason
                                                            }
                                                        )

                                                    }, timeoutAmount)
                                                }


                                                howManyBansHaveBeenSubmittedSoFar = howManyBansHaveBeenSubmittedSoFar + 1;
                                            }


                                        }
                                    }


                                }

                            }
                        })
                    })



                //console.log(listofusersbannedinindividualserver)

                //console.log()
            })


        })

        //now all bans have been completed
    });


    //console.log(parametersServers)
}



export async function runOnStartup(cassandraclient, client) {
    //This Function will automatically create the adoramoderation keyspace if it doesn't exist, otherwise, carry on
    await cassandraclient.execute("CREATE KEYSPACE IF NOT EXISTS adoramoderation WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy',  'datacenter1': 1  };")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
            /*console.log(result)*/
        }).catch(error => console.error(error));

    //Goes inside adora moderation keyspace, makes the table "guildssubscribedtoautoban"
    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.guildssubscribedtoautoban (serverid text PRIMARY KEY, subscribed boolean, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid);")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
            /*console.log(result)*/
        }).catch(error => console.error(error));

    //Goes inside adora moderation keyspace, makes the table "banneduserlist"
    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.banneduserlist (banneduserid text PRIMARY KEY, banned boolean, reason text, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid, unknownuser boolean);")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
        }).catch(error => console.error(error));

    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.completedbans (guildid text, userid text, timeofban bigint, PRIMARY KEY (guildid, userid))")

    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.nonmemberbanlimit (guildid text PRIMARY KEY, time bigint)")

    everyServerRecheckBans(cassandraclient, client, false)
}