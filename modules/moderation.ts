var forEach = require("for-each")
const TimeUuid = require('cassandra-driver').types.TimeUuid;
//Generate time with TimeUuid.now();

const userIDsRegex = /^(?:<@\D?)?(\d+)(?:>)?\s*,?\s*/;

const userReg = RegExp(/<@!?(\d+)>/);

export async function banGuildMember(message) {
    //check if user trying to do the command has permissions
    if(message.member.hasPermission('BAN_MEMBERS')) {
        message.reply("You have the permission to ban!")
    } else {
        message.reply("You do not have permission to ban users in this guild.")
    }

    var userIdArray = []

    forEach(userIdArray, function() {
        
    })

}

export async function processAllModerationCommands(message,command,args,config,cassandraclient) {

    const isDM:boolean = message.guild === null;

    if (command === "adoraban") {    

        var isauthorizedtoaddbanstodatabase:boolean = false;

        forEach(config.allowedToBanUsers, function (value, key, array) {
            if(value.userid === message.author.id) {
                isauthorizedtoaddbanstodatabase = true;
            } else {
                
            }
        });

        if (isauthorizedtoaddbanstodatabase) {
            message.reply("You are authorized")
            //split message into list of userids and reason

            //this line prevents accidental role mentions from being added
            var roleMentionsRemoved = message.content.replace(/<@&(\d{18})>/g, '')

            //transforms the user id list into a list to be banned
            var arrayOfUserIdsToBan = roleMentionsRemoved.match(/(?<!\d)\d{18}(?!\d)/g);

            if(arrayOfUserIdsToBan) {message.channel.send(`Banning ${arrayOfUserIdsToBan.length} users.`)}

            var reasonForBanRegister = roleMentionsRemoved.replace(/(<@!?(\d+)>(,|\.|\ )*)/g, '').replace(/(?<!\d)\d{18}(?!\d)/g, '').replace(/(a!(\ )*adoraban(\ )*)/g, '').trim()
            //apply the bans to the database
            message.channel.send(`Reason: ${reasonForBanRegister}`)

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
                    await cassandraclient.execute(query, params, { prepare: true }, function (err) {
                        console.log(err);
                    //Inserted in the cluster
                    });
                    
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

        if (!isDM) {
                    //check if server is registered
        const lookupexistingsubscriptionquery = 'SELECT serverid, subscribed, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime FROM adoramoderation.guildssubscribedtoautoban WHERE serverid = ?';

        var readExistingSubscriptionStatus : boolean = false;

        await cassandraclient.execute(lookupexistingsubscriptionquery, [ message.guild.id ])
        .then(fetchExistingSubscriptionResult => {
            console.log(fetchExistingSubscriptionResult)
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

            //show autoban help page
            message.reply({
                "content": "Usage: `a!autoban on/off`",
                "embed": {
                  "title": "Autoban Feature",
                  "description": "Automatically bans user accounts known for raiding, racism, lgbtq+phobia, disruption of servers based on ban list reports.\nAdministrators can enable autoban by typing `a!autoban on` and disable new bans from happening via `a!autoban off`",
                  "fields": [
                    {
                      "name": "Is Autoban On for this server?",
                      "value": `${autobanstatustext}`
                    }
                  ]
                }
              })
        }

        if((!isDM)) {
            if (message.member.hasPermission("ADMINISTRATOR")) {
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
                    console.log(params)
                    await cassandraclient.execute(query, params, { prepare: true }, function (err) {
                        console.log(err);
                    //Inserted in the cluster
                    });
                    if (subscribeStateToWrite === true) {
                        await message.reply("This server is now subscribed to autobans! To turn it off, type `a!autoban off`")

                        if (message.guild.me.hasPermission("ADMINISTRATOR")) {
                            
                        } else {
                            message.reply("Adorabot needs Administrator permissions for this to work! \nPlease turn on Administrator in `Server Settings > Roles > Adora > Permissions > Administrator` and slide the switch for Administrator to the right.")
                        }

                        //after, go back and read the entire ban log to make sure everyone in the list is banned
                        await cassandraclient.execute("SELECT * FROM adoramoderation.banneduserlist WHERE banned = true ALLOW FILTERING;").then(fetchAllBansResult => {
                            console.log(fetchAllBansResult);
                                forEach(fetchAllBansResult.rows, async function (banRowValue, banRowKey, banRowArray) {
                                    var toBanReason:string;
                                    if (!banRowValue.reason || banRowValue.reason.length == 0) {
                                        toBanReason = "Banned by Adora's Automagical system!"
                                    } else {
                                        toBanReason = `${banRowValue.reason} | Banned by Adora's Automagical system!`
                                    }
                                    await message.guild.members.ban(banRowValue.banneduserid, {'reason': toBanReason})
                                        .then(user => console.log(`Banned ${user.username || user.id || user} from ${message.guild.name}`))
                                        .catch(console.error);
                                })
                            
                        }
                        ).catch(error => console.error(error));
                    } else {
                        if (subscribeStateToWrite === false) {
                            await message.reply("This server is now unsubscribed to autobans! To turn autoban back on, type `a!autoban on`")
                        }
                    }
                }
                    
                }
            else {
                await message.reply("You don't have permission to toggle this feature. Only Administrators of the current guild can turn autoban on and off");
            }
        }
        else 
        {
            await message.reply("You are accessing this command in a DM. Only Administrators of the current guild can turn autoban on and off");
        }
    }
}

export async function runOnStartup(cassandraclient, client) {
    //This Function will automatically create the adoramoderation keyspace if it doesn't exist, otherwise, carry on
  await cassandraclient.execute("CREATE KEYSPACE IF NOT EXISTS adoramoderation WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy',  'datacenter1': 1  };")
  .then(result => console.log(result)).catch(error => console.error(error));

  //Goes inside adora moderation keyspace, makes the table "guildssubscribedtoautoban"
  await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.guildssubscribedtoautoban (serverid text PRIMARY KEY, subscribed boolean, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid);").then(result => console.log(result)).catch(error => console.error(error));

  //Goes inside adora moderation keyspace, makes the table "banneduserlist"
  await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.banneduserlist (banneduserid text PRIMARY KEY, banned boolean, reason text, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid);").then(result => console.log(result)).catch(error => console.error(error));

  //start listening to new incoming bans
   //stream each new ban that arrives
  await cassandraclient.stream('SELECT banneduserid, banned, reason, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime FROM adoramoderation.banneduserlist')
  .on('readable', async function () {
    // 'readable' is emitted as soon a row is received and parsed
    let row;
    while (row = this.read()) {
      //console.log('time %s and value %s', row.time, row.val);
      
      console.log(`Incoming AutoBan: ${row.banneduserid} status: ${row.banned} for reason ${row.reason}`)

        var currentShardServerIDArray = []

      await client.guilds.cache.forEach(guild => {
          //console.log(`${guild.name} | ${guild.id}`);
          currentShardServerIDArray.push(guild.id)
      })

      console.log(currentShardServerIDArray)

      //each shard fetch it's servers it's able to ban the user on
      var queryForMatchingServers = ('SELECT serverid, subscribed, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime FROM adoramoderation.guildssubscribedtoautoban WHERE serverid IN ? AND subscribed = ? ALLOW FILTERING;')

      if (currentShardServerIDArray.length > 0) {
        var parametersServers = [currentShardServerIDArray, true];
        await cassandraclient.execute( queryForMatchingServers, parametersServers, { prepare: true })
        .then(matchingServerList => {
            console.log(matchingServerList)
            //.rows.length === 0
            forEach(matchingServerList.rows.length, async function(eachServerThatIsSubscribed) {
                //eachServerThatIsSubscribed.serverid
                var individualservertodoeachban = client.guilds.cache.get(eachServerThatIsSubscribed.serverid);

                individualservertodoeachban.members.ban(${row.banneduserid})
                    .then(user => console.log(`Banned ${user.username || user.id || user} from ${guild.name}`))
                    .catch(console.error);
            })
      })
      }
    

      
    }
  })
  .on('end', function () {
    // Stream ended, there aren't any more rows
  })
  .on('error', function (err) {
    // Something went wrong: err is a response error from Cassandra
  });
}