var forEach = require("for-each")
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const editJsonFile = require("edit-json-file");
var importconfigfile = editJsonFile(`${__dirname}/../config.json`);
//let file = editJsonFile(`${__dirname}/config.json`);
//Generate time with TimeUuid.now();

const userIDsRegex = /^(?:<@\D?)?(\d+)(?:>)?\s*,?\s*/;

const userReg = RegExp(/<@!?(\d+)>/);

export async function banGuildMember(message) {
    //check if user trying to do the command has permissions
    if(message.member.permissions.has('BAN_MEMBERS')) {
        message.reply("You have the permission to ban!")
    } else {
        message.reply("You do not have permission to ban users in this guild.")
    }

    var userIdArray = []

    forEach(userIdArray, function() {
        
    })

}

export async function howManyUsersInBanDatabase(cassandraclient) {
    var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
    await cassandraclient.execute(lookuphowmanybannedusersquery)
    .then(async returnBanDatabaseAmount => {
        var numberofrowsindatabase = await returnBanDatabaseAmount.rows[0].count.low
        console.log(typeof numberofrowsindatabase + numberofrowsindatabase)
        return numberofrowsindatabase;
    })
}

export async function processAllModerationCommands(message,command,args,config,cassandraclient,client) {

    const isDM:boolean = message.guild === null;

    if (command === "mooooocowwwww") {
        message.reply(`${__dirname}`)
    }

    if (command === "adoraban") {    

        var isauthorizedtoaddbanstodatabase:boolean = false;

        var loadedConfigData = importconfigfile.get()

        console.log(loadedConfigData)

        forEach(loadedConfigData.config.allowedToBanUsers, function (value, key, array) {
            if(value.userid === message.author.id) {
                isauthorizedtoaddbanstodatabase = true;
            } else {
                
            }
        });

        if (isauthorizedtoaddbanstodatabase) {
            await message.reply("You are authorized")
            //split message into list of userids and reason

            //this line prevents accidental role mentions from being added
            var roleMentionsRemoved = message.content.replace(/<@&(\d{18})>/g, '')

            //transforms the user id list into a list to be banned
            var arrayOfUserIdsToBan = roleMentionsRemoved.match(/(?<!\d)\d{18}(?!\d)/g);

            if(arrayOfUserIdsToBan) {
                await message.channel.send(`Banning ${arrayOfUserIdsToBan.length} users.`)
            }

            var reasonForBanRegister = roleMentionsRemoved.replace(/(<@!?(\d+)>(,|\.|\ )*)/g, '').replace(/(?<!\d)\d{18}(?!\d)/g, '').replace(/(a!(\ )*adoraban(\ )*)/g, '').trim()
            //apply the bans to the database
            await message.channel.send(`Reason: ${reasonForBanRegister}`)

            forEach(arrayOfUserIdsToBan, async function(individualUserIdToAddToBanDatabase, keyBan, arrayBan) {
                //write bans to adoramoderation.banneduserlist
                //banneduserid text PRIMARY KEY, banned boolean, reason text, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid);

                    const lookupexistingbanquery = 'SELECT banneduserid, banned, reason, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime FROM adoramoderation.banneduserlist WHERE banneduserid = ?';
                
                    var isBanRecordNew : boolean;
                    var banFirstChangedByIdInitialState;
                    var banFirstChangedTimeInitialState;

                    //lookup each user id in cassandra
                    await cassandraclient.execute(lookupexistingbanquery, [ individualUserIdToAddToBanDatabase ])
                    .then(fetchExistingBanResult => {

                        //is there a record matching it?
                        if(fetchExistingBanResult.rows.length === 0) {
                            //entry hasn't happened before
                            console.log("new ban entry")
                            isBanRecordNew = true;
                            banFirstChangedByIdInitialState = message.author.id;
                            banFirstChangedTimeInitialState = TimeUuid.now();
                        } else {
                            console.log("not a new entry, existing record found")
                            isBanRecordNew = false;
                            banFirstChangedByIdInitialState = fetchExistingBanResult.rows[0].firstchangedbyid;
                            banFirstChangedTimeInitialState = fetchExistingBanResult.rows[0].firstchangedtime;
                        }

                    })

                    const query = 'INSERT INTO adoramoderation.banneduserlist (banneduserid, banned, reason, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime) VALUES (?, ?, ?, ?, ?, ?, ?)';
                        var params;
                        if (isBanRecordNew) {
                            params = [individualUserIdToAddToBanDatabase, true, reasonForBanRegister, banFirstChangedByIdInitialState , banFirstChangedTimeInitialState, banFirstChangedByIdInitialState , banFirstChangedTimeInitialState];
                        } else {
                            params = [individualUserIdToAddToBanDatabase, true, reasonForBanRegister, message.author.id, TimeUuid.now(), firstchangedbyidfirststate, firstchangedtimefirststate];
                        }
                    console.log(params)
                    await cassandraclient.execute(query, params, { prepare: true }, await function (err) {
                        console.log(err);
                    //Inserted in the cluster
                    });

                    //now update every server
                    //await runBanStream(cassandraclient, client)

                    //instruct every server to run the ban stream
                   await client.shard.broadcastEval(`this.everyServerRecheckBansOnThisShard()`)
                   //await everyServerRecheckBans(cassandraclient,client)
            })   
        } else {
            message.reply("You don't have permission to do that!")
        }

    }

    if (command === "autoban") {

        var subscribeStateToWrite : boolean;
        var isNewEntry: boolean;
        var firstchangedbyidfirststate;
        var firstchangedtimefirststate;
        var validToggleArgument : boolean = (args[0] === "yes" || args[0]==="no" || args[0]==="on" || args[0]==="off" || args[0]==="true" || args[0]==="false")

        var numberOfBannedUsersInDatabase;

        var lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
        await cassandraclient.execute(lookuphowmanybannedusersquery)
        .then(async returnBanDatabaseAmount => {
            var numberofrowsindatabase = returnBanDatabaseAmount.rows[0].count.low
            console.log(typeof numberofrowsindatabase + numberofrowsindatabase)
            numberOfBannedUsersInDatabase = numberofrowsindatabase;      
            
            if (!isDM) {
                //check if server is registered
    const lookupexistingsubscriptionquery = 'SELECT serverid, subscribed, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime FROM adoramoderation.guildssubscribedtoautoban WHERE serverid = ?';

    var readExistingSubscriptionStatus : boolean = false;

    await cassandraclient.execute(lookupexistingsubscriptionquery, [ message.guild.id ])
    .then(fetchExistingSubscriptionResult => {
        //console.log(fetchExistingSubscriptionResult)
        if(fetchExistingSubscriptionResult.rows.length === 0) {
            //entry hasn't happened before
            console.log("new entry")
            isNewEntry = true;
            firstchangedbyidfirststate = message.author.id;
            firstchangedtimefirststate =  TimeUuid.now();
            readExistingSubscriptionStatus = false;
        }
        else {
            console.log("old entry")
            isNewEntry = false;
            firstchangedbyidfirststate = fetchExistingSubscriptionResult.rows[0].firstchangedbyid;
            firstchangedtimefirststate = fetchExistingSubscriptionResult.rows[0].firstchangedtime;
            readExistingSubscriptionStatus = fetchExistingSubscriptionResult.rows[0].subscribed;
        }
    });
    }

    //if argument is empty or if the first argument is not a valid toggle argument
    if ((!validToggleArgument)) {

        var autobanstatustext:string;
        if (readExistingSubscriptionStatus) {
            autobanstatustext = "On"
        } else {
            autobanstatustext = "Off"
        }

        console.log(`numberOfBannedUsersInDatabase ${numberOfBannedUsersInDatabase}`)

        //show autoban help page
        await message.reply({
            "content": "Usage: `a!autoban on/off`",
            "embed": {
              "title": "Autoban Feature",
              "image": {
                "url": "https://user-images.githubusercontent.com/7539174/111216262-6ff4d300-8591-11eb-902c-a25e1595730c.png"
              },
              "description": "Automatically bans user accounts known for raiding, racism, lgbtq+phobia, disruption of servers based on ban list reports and blacklists.\nAdministrators can enable autoban by typing `a!autoban on` and disable new bans from happening via `a!autoban off`",
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
            }
          })
    }

    if((!isDM)) {
        if (message.member.permissions.has("ADMINISTRATOR")) {
            console.log("user has permissions to ban inside this guild")
                if (args[0] === "yes" || args[0]==="on" || args[0] ==="true") {
                    var subscribeStateToWrite = true
                }
                if (args[0] === "no" || args[0]==="off" || args[0] ==="false") {
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
                            "embed": {
                              "description": " ╭₊˚ʚ[🍰]ɞ・[This server is now subscribed to autobans!]\n ╰₊˚ʚ[🍩]ɞ・[To turn it off, type `a!autoban off`] \` \n★ ⋆◗ ૪ 𖤩˖࣪ ◖ ִֶָ ໑ ָ࣪ ¡﹆:spider:ꔛ:candy:ෆ ✿:rabbit2::cherries:*◞:chains: ˊˎ -",
                              "image": {
                                "url": "https://user-images.githubusercontent.com/7539174/111216153-49369c80-8591-11eb-8eaf-0a0f13bf875c.png"
                              }
                            }
                          }
                    )

                    if (message.guild.me.permissions.has("BAN_MEMBERS")) {
                        
                    } else {
                        message.reply("Adorabot needs BAN_MEMBERS permissions for this to work! \nPlease turn on Administrator in `Server Settings > Roles > Adora > Permissions > Administrator` and slide the switch for Administrator to the right.")
                    }

                    //after, go back and read the entire ban log to make sure everyone in the list is banned
                    await cassandraclient.execute("SELECT * FROM adoramoderation.banneduserlist WHERE banned = true ALLOW FILTERING;").then(async fetchAllBansResult => {
                        console.log(fetchAllBansResult);
                        //for each user that is banned in the database

                        var listofusersbannedinindividualserver = await message.guild.fetchBans();

                            forEach(fetchAllBansResult.rows, async function (banRowValue, banRowKey, banRowArray) {
                               


                                var isUserBannedFromThisGuild = listofusersbannedinindividualserver.has(banRowValue.banneduserid)
                                //  console.log(`is ${eachBannableUserRow.banneduserid} banned from ${individualservertodoeachban}: ${isUserBannedFromThisGuild}`)

                                if (isUserBannedFromThisGuild) {
                                    //this user is already fuckin banned
                                }
                                else {
                                    //THE BAN HAMMER FUCKING STRIKES!

                                    var toBanReason:string;
                                if (!banRowValue.reason || banRowValue.reason.length == 0) {
                                    toBanReason = "Banned by Adora's Automagical system!"
                                } else {
                                    toBanReason = `${banRowValue.reason} | Banned by Adora's Automagical system!`
                                }

                                await message.guild.members.ban(banRowValue.banneduserid, {'reason': toBanReason})
                                    .then(user => console.log(`Banned ${user.username || user.id || user} from ${message.guild.name}`))
                                    .catch(console.error);
                                }

                               
                            })
                        
                    }
                    ).catch(error => console.error(error));
                } else {
                    if (subscribeStateToWrite === false) {
                        //await message.reply("This server is now unsubscribed to autobans! To turn autoban back on, type `a!autoban on`")
                        await message.reply(
                            {
                                "embed": {
                                  "description": " ╭₊˚ʚ[:herb:]ɞ・[This server is now unsubscribed to autobans!] \n ﹕˚₊  ❀ ꒱⋅** :warning: You're no longer protected from known raiders from entering your safe space :warning: ** ๑˚₊⊹ \n╰₊˚ʚ[:fish_cake:]ɞ・[To turn autoban back on, type `a!autoban on`] \` \n★ ⋆◗ ૪ 𖤩˖࣪ ◖ ִֶָ ໑ ָ࣪ ¡﹆:spider:ꔛ:candy:ෆ ✿:rabbit2::cherries:*◞:chains: ˊˎ -",
                                  "image": {
                                    "url": "https://user-images.githubusercontent.com/7539174/111224943-5b6a0800-859c-11eb-90bc-8806a51fd681.jpg"
                                  }
                                }
                              }
                        )
                    }
                }
            }
                
            }
        else {
            await message.reply("You don't have permission to toggle this feature. Only Administrators of the current guild can turn autoban on and off \n 𓆩 𓆪 ʾ ִֶָ%˓ ᵎ ҂ ࣪˖﹫𓂃⌁. ࣪˖");
        }
    }
    else 
    {
        await message.reply("You are accessing this command in a DM. Only Administrators of the current guild can turn autoban on and off");
    }
        })
    }
}

export async function everyServerRecheckBans(cassandraclient,client) {
    //for every server subscribed
    //fetch the ban list for the server
    
    //fetch the ban database
    //is each ban inside the database?
    //if not, ban them
    var currentShardServerIDArray = []

    await client.guilds.cache.forEach(guild => {
        //console.log(`${guild.name} | ${guild.id}`);
        currentShardServerIDArray.push(guild.id)
        //console.log("guild.id " + guild.id)
    })


    var queryForBanList = "SELECT * FROM adoramoderation.banneduserlist WHERE banned = ? ALLOW FILTERING;"
    var parametersForBanList = [true];
    var globallistOfBannableUsers
    //fetch the ban database
await cassandraclient.execute(queryForBanList, parametersForBanList, {prepare: true})
.then(listOfBannableUsers => {
    globallistOfBannableUsers = listOfBannableUsers;
})

console.log(`currentShardServerIDArray.length = ${currentShardServerIDArray.length}`)

//each shard fetch it's servers it's able to ban the user on
var queryForMatchingServers = ('SELECT * FROM adoramoderation.guildssubscribedtoautoban WHERE serverid IN ? AND subscribed = ? ALLOW FILTERING;')

var listOfQueriesToSendToScylla = []

//For Every server in the array, transform it into a query to send to Cassandra
await forEach(currentShardServerIDArray, async (eachServerIdItem) => {
    //console.log(eachServerIdItem)

    var serverIdArrayThing = []
    serverIdArrayThing.push(eachServerIdItem)

    var parametersServers = [serverIdArrayThing, true];

    listOfQueriesToSendToScylla.push(cassandraclient.execute( queryForMatchingServers, parametersServers, { prepare: true }))

    })

    //console.log(listOfQueriesToSendToScylla)

    //Run All the queries, then
   await Promise.all(listOfQueriesToSendToScylla ).then(async function (values) {
       //console.log(values)

       //For Each server in the shard that is subscribed, run the ban database check
       forEach(values, async (matchingServerList) => {
           //console.log(matchingServerList.rows.length)

            //console.log(matchingServerList)
    console.log(`${matchingServerList.rows.length} matching servers`)
    //.rows.length === 0

            //for each server that the shard client is able to ban on...
            forEach(matchingServerList.rows, async function(eachServerThatIsSubscribed) {
                //console.log("serverid to work on" + eachServerThatIsSubscribed.serverid)
                var individualservertodoeachban = await client.guilds.cache.get(eachServerThatIsSubscribed.serverid);

                //console.log(individualservertodoeachban)

                var listofusersbannedinindividualserver = await individualservertodoeachban.fetchBans();

                //check if list of users has the user that we want to ban
                forEach(globallistOfBannableUsers.rows, async function (eachBannableUserRow) {
                    var isUserBannedFromThisGuild = listofusersbannedinindividualserver.has(eachBannableUserRow.banneduserid)
                  //  console.log(`is ${eachBannableUserRow.banneduserid} banned from ${individualservertodoeachban}: ${isUserBannedFromThisGuild}`)

                  if (isUserBannedFromThisGuild) {
                      //this user is already fuckin banned
                  }
                  else {
                      //THE BAN HAMMER STRIKES!

                      var toBanReason:string;
                                    if (!eachBannableUserRow.reason || eachBannableUserRow.reason.length == 0) {
                                        toBanReason = "Banned by Adora's Automagical system!"
                                    } else {
                                        toBanReason = `${eachBannableUserRow.reason} | Banned by Adora's Automagical system!`
                                    }

                                    //trim the reason text to 512 char just in case it fails because the reason is too long
                                    toBanReason = toBanReason.substring(0,511)

                      await individualservertodoeachban.members.ban(eachBannableUserRow.banneduserid, {'reason': toBanReason})
                        .then(user => console.log(`Banned ${user.username || user.id || user} from ${individualservertodoeachban.name}`))
                        .catch(console.error);
                  }
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
.then(result => {/*console.log(result)*/}).catch(error => console.error(error));

  //Goes inside adora moderation keyspace, makes the table "guildssubscribedtoautoban"
  await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.guildssubscribedtoautoban (serverid text PRIMARY KEY, subscribed boolean, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid);")
.then(result => {/*console.log(result)*/}).catch(error => console.error(error));

  //Goes inside adora moderation keyspace, makes the table "banneduserlist"
  await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.banneduserlist (banneduserid text PRIMARY KEY, banned boolean, reason text, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid);")
  .then(result => {/*console.log(result)*/}).catch(error => console.error(error));

  await everyServerRecheckBans(cassandraclient,client)
}