var forEach = require("for-each")
const TimeUuid = require('cassandra-driver').types.TimeUuid;
//Generate time with TimeUuid.now();

const userIDsRegex = /^(?:<@\D?)?(\d+)(?:>)?\s*,?\s*/;

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
                  "description": "Autoban automatically bans raiders that have been registered in the system.\nAdministrators can enable autoban by typing `a!autoban on` and disable new bans from happening via `a!autoban off`",
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

export async function runOnStartup(cassandraclient) {
    //This Function will automatically create the adoramoderation keyspace if it doesn't exist, otherwise, carry on
  await cassandraclient.execute("CREATE KEYSPACE IF NOT EXISTS adoramoderation WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy',  'datacenter1': 1  };")
  .then(result => console.log(result)).catch(error => console.error(error));

  //Goes inside adora moderation keyspace, makes the table "guildssubscribedtoautoban"
  await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.guildssubscribedtoautoban (serverid text PRIMARY KEY, subscribed boolean, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid);").then(result => console.log(result)).catch(error => console.error(error));

  //Goes inside adora moderation keyspace, makes the table "banneduserlist"
  await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.banneduserlist (banneduserid text PRIMARY KEY, banned boolean, reason text, lastchangedbyid text, lastchangedtime timeuuid, firstchangedbyid text, firstchangedtime timeuuid);").then(result => console.log(result)).catch(error => console.error(error));

  //start listening to new incoming bans
  
}