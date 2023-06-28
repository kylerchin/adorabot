var _ = require('lodash');
var forEach = require('for-each')
import { Message, MessageOptions, Util, CommandInteraction } from 'discord.js'
var Discord = require('discord.js')
const TimeUuid = require('cassandra-driver').types.TimeUuid;
import { cassandraclient } from './cassandraclient'
import { logger, tracer, span } from './logger'
import { replyorfollowup } from './replyorfollowup';
import { splitMessage } from './util'

//stolen from https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function (a, b) { return a.value - b.value; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
}

export function sendVoteLinks(message: Message | CommandInteraction) {
    message.reply("Voting sites, each site earns 1 vote:\nTop.gg: https://top.gg/bot/737046643974733845/vote\nDiscord Bot List: https://discordbotlist.com/bots/adora-ahelp/upvote\nCheck that your vote has been counted in the leaderboard with `/votes`")
}

interface showTopVotersArgs {
    message: Message;
    [key: string]: any;
    client: any;
}

interface showTopVotersArgsInteraction {
    interaction: CommandInteraction;
    client: any;
}

export async function showListOfVotersTimes(voteArgs: showTopVotersArgs) {
    var today = new Date()
    var priorDate = new Date().setDate(today.getDate() - 7)
    const id2 = TimeUuid.fromDate(new Date(priorDate));
    var query = "SELECT * from adoravotes.votes WHERE time >= ? ALLOW FILTERING";
    var params = [id2]

    const result = await cassandraclient.execute(query, params, { prepare: true });

    for await (const row of result) {
        console.log(row.userid);

        var timeOfVote = row.time.getDate();

        console.log(timeOfVote)
    }

    // emitted when all rows have been retrieved and read
}

export async function showTopVotersInteraction(voteArgs: showTopVotersArgsInteraction) {
    try {

        console.log('showTopVotersInteraction called')

        var leaderboard = {}

        var totalStats = {
            "discordbotlist": 0,
            "topgg": 0,
            "topggmtd": 0
        }

        const options = { prepare: true, fetchSize: 1000 };

        //schema 
        //time timeuuid PRIMARY KEY, voteservice text, userid text

        //var query = "SELECT * from adoravotes.votes";
        //var params = []

        var today = new Date()
        var priorDate = new Date().setDate(today.getDate() - 30)
        const id2 = TimeUuid.fromDate(new Date(priorDate));
        var query = "SELECT * from adoravotes.votes WHERE time >= ? ALLOW FILTERING";
        var params = [id2]

        var lastVoteTimeForReqUserTopgg = 0
        var lastVoteTimeForReqUserDbl = 0
        var authorid = voteArgs.interaction.user.id;

        const result = await cassandraclient.execute(query, params, { prepare: true });

        console.log('cassandra query is done')

        for await (const row of result) {
            console.log(row.userid);

            if (row.userid === authorid) {
                console.log('found author id in req');
                await logger.discordInfoLogger.info("found author in req", { type: "debugvote" });
                if (row.voteservice == "topgg") {
                    if (lastVoteTimeForReqUserTopgg < row.time.getDate().getTime()) {
                        lastVoteTimeForReqUserTopgg = row.time.getDate().getTime();
                    }
                }
                if (row.voteservice == "discordbotlist") {
                    if (lastVoteTimeForReqUserDbl < row.time.getDate().getTime()) {
                        lastVoteTimeForReqUserDbl = row.time.getDate().getTime();
                    }
                }
            }

            console.log(row.voteservice);
            totalStats[`${row.voteservice}`] += 1;

            var firstDateOfMonthUTC = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth()));

            console.log('first date of month utc line executed')

            if (row.voteservice === 'topgg' && row.time.getDate() > firstDateOfMonthUTC) {
                totalStats['topggmtd'] += 1;
            }

            // process row
            // Invoked per each row in all the pages
            var userid = row.userid
            console.log(userid)

            if (!(leaderboard[userid] === undefined)) {
                //add to the number
                console.log("it's already in here")
                leaderboard[userid] = leaderboard[userid] + 1
            } else {
                leaderboard[userid] = 1
            }
        }

        // emitted when all rows have been retrieved and read

        console.log(leaderboard);



        if (_.size(leaderboard) === 0) {
            replyorfollowup(
                {
                    messageorinteraction: voteArgs.interaction,
                    content: "No votes have been cast yet. Vote for me on top.gg and discordbotlist.com to be added to the leaderboard!",
                    tryagaininfiveseconds: true
                }
            )
        } else {
            console.log("presorted")
            console.log(leaderboard)
            var sortedLeaderboard = sortObject(leaderboard);
            console.log("post-sorted")
            console.log(sortedLeaderboard)

            //reverse the order os it's most votes at tehe top
            sortedLeaderboard = sortedLeaderboard.reverse()

            //sortedLeaderboard = sortedLeaderboard.slice(0, 100);

            /* const sortedLeaderboardPromise = await sortedLeaderboard.map(async (eachUser) => {
         
                 console.log(eachUser)
         
                 var userResults = voteArgs.client.users.fetch(eachUser.key, true, true).then(async (user) => {
                     console.log(user)
                     return {id: eachUser.key, user: user, votes: eachUser.value}})
                 .catch((error) => {return {id: eachUser.id, error: error}})
         
                 return userResults
         
             })*/

            const sortedLeaderboardPromise = await Promise.all(sortedLeaderboard.map(async (eachUser) => {
                console.log(eachUser)

                var userResults = await voteArgs.client.users.fetch(eachUser.key, true, true).then(async (user) => {
                    console.log(user)
                    return { id: eachUser.key, user: user, votes: eachUser.value }
                })
                    .catch((error) => { return { id: eachUser.id, error: error } })

                return userResults
            }));

            console.log(sortedLeaderboardPromise);

            Promise.all(sortedLeaderboardPromise).then(async (sortedLeaderboard) => {



                console.log(sortedLeaderboard)

                sortedLeaderboard = sortedLeaderboard.filter(eachuser => (!(eachuser.error)));

                var totalNumberOfUsers = _.size(sortedLeaderboard)

                sortedLeaderboard = sortedLeaderboard.slice(0, 1000);

                const sortedFormattedRowsPromise = sortedLeaderboard.map(async (eachUser, index) => {

                    console.log("map out: " + index)
                    console.log(eachUser)
                    //var avatarURL = await eachUser.user.displayAvatarURL();
                    //return {
                    //   "title": `#${index + 1} - ${eachUser.user.tag}`,
                    //     "description": `${eachUser.votes} Votes`
                    //}

                    return `\`#${index + 1}\`|\`${eachUser.votes} votes\` ${eachUser.user.username}`

                })

                Promise.all(sortedFormattedRowsPromise).then(async (sortedFormatedRows) => {
                    console.log("second promise")
                    var currentPage: string = "";
                    var currentPageStage: string = "";
                    var pages: Array<string> = []

                    console.log(sortedFormatedRows)

                    /*forEach(sortedFormatedRows, function (eachFormattedRow, indexOfRow) {
                        console.log(eachFormattedRow)
                        currentPageStage = currentPageStage + eachFormattedRow + "\n";
                
                        console.log("currentPageStage")
                        console.log(currentPageStage)
                
                        // logger.discordInfoLogger.info("key is " + key + " array size is " + charts.length)
                    
                         if(currentPageStage.length > 1500 || (indexOfRow != sortedFormatedRows.length-1)) {
                             //write currentpagestage to currentpage
                           // logger.discordInfoLogger.info({type: "billboardChartListTest", message: "currentPageStage.length < 2000"})
                            
                         } else {
                            console.log("Last block")
                            //if(key === ) {
                    
                             //}
                             currentPageStage = eachFormattedRow + "\n";
                             pages.push(currentPageStage)
                            //logger.discordInfoLogger.info({type: "billboardChartListTest", message: "currentPageStage.length >= 2000"})
                         }    
                
                        });*/

                    pages = splitMessage(sortedFormatedRows.join("\n"), { maxLength: 1500 })

                    console.log(pages)

                    var twelvehours = 12 * 60 * 60 * 1000

                    var voteAskString = "Your Next Vote Times:"

                    await logger.discordInfoLogger.info("top gg time is " + lastVoteTimeForReqUserTopgg + "dbl is" +
                        lastVoteTimeForReqUserDbl, { type: "debugvote" });

                    //format next time to vote
                    if (lastVoteTimeForReqUserTopgg < Date.now() - twelvehours) {
                        voteAskString += "\nTop.gg: Now! :white_check_mark:"
                    } else {
                        var nextVoteUnixTopgg = Math.round((lastVoteTimeForReqUserTopgg + twelvehours) / 1000)
                        voteAskString += `\nTop.gg: <t:${nextVoteUnixTopgg}:R>\n <t:${nextVoteUnixTopgg}:d> <t:${nextVoteUnixTopgg}:T>`
                    }

                    voteAskString += "\nhttps://top.gg/bot/737046643974733845/vote"

                    //format next time to vote
                    if (lastVoteTimeForReqUserDbl < Date.now() - twelvehours) {
                        voteAskString += "\nDBL: Now! :white_check_mark:"
                    } else {
                        var nextVoteUnixDbl = Math.round((lastVoteTimeForReqUserDbl + twelvehours) / 1000)
                        voteAskString += `\nDBL: <t:${nextVoteUnixDbl}:R>\n <t:${nextVoteUnixDbl}:d> <t:${nextVoteUnixDbl}:T>`
                    }

                    voteAskString += "\nhttps://discordbotlist.com/bots/adora-ahelp/upvote"

                    const pageEmbedArray = await pages.map((page, pageindex) => {

                        //var descForPage = page
                        var messageMap = {
                            "content": `Vote for Adora with \`a!vote\` to show up on the leaderboard!\n${voteAskString}`,
                            "embeds": [{
                                "description": page,
                                "title": `Top Voters (past 30 days)`,
                                "footer": {
                                    "text": `Anonymized for privacy reasons.\nPage ${pageindex + 1} out of ${pages.length} pages.`
                                },
                                "fields": [
                                    {
                                        "name": "Top.gg votes",
                                        "value": `${totalStats.topgg}`,
                                        "inline": true
                                    },
                                    {
                                        "name": "Top.gg votes this month (actual ranking)",
                                        "value": `${totalStats.topggmtd}`,
                                        "inline": true
                                    },
                                    {
                                        "name": "Discordbotlist votes",
                                        "value": `${totalStats.discordbotlist}`
                                    }
                                ]
                            }]
                        }

                        return messageMap;
                    }

                    )

                    console.log('pageEmbedArray')
                    console.log(pageEmbedArray)
                    //console.log(pageEmbedArray[0].embeds)

                    var pageCounter = 0;

                    voteArgs.interaction.reply(pageEmbedArray[pageCounter]).then(async (messageVotes: Message) => {
                        if (pages.length != 1) {
                            messageVotes.react('⬅').then(r => {
                                messageVotes.react('➡').then(r => {
                                    messageVotes.react("🗑")

                                    // Filters
                                    const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === authorid
                                    const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === authorid
                                    const deleteFilter = (reaction, user) => reaction.emoji.name === '🗑' && user.id === authorid

                                    const timeOfTimer = 60 * 60 * 1000
                                    const backwards = messageVotes.createReactionCollector({ filter: backwardsFilter, time: timeOfTimer })
                                    const forwards = messageVotes.createReactionCollector({ filter: forwardsFilter, time: timeOfTimer })
                                    const deleteCollector = messageVotes.createReactionCollector({ filter: deleteFilter, time: timeOfTimer })

                                    backwards.on('collect', (r, u) => {
                                        if (pageCounter === 0) {
                                            pageCounter = pages.length - 1
                                        } else {
                                            pageCounter--
                                        }
                                        messageVotes.edit(pageEmbedArray[pageCounter])
                                        r.users.remove(r.users.cache.filter(u => u === voteArgs.interaction.author).first())
                                    })

                                    forwards.on('collect', (r, u) => {
                                        if (pageCounter === pageEmbedArray.length - 1) {
                                            pageCounter = 0;
                                        } else {
                                            pageCounter++
                                        }
                                        messageVotes.edit(pageEmbedArray[pageCounter])
                                        r.users.remove(r.users.cache.filter(u => u === voteArgs.interaction.user).first())
                                    })

                                    deleteCollector.on('collect', (r, u) => {
                                        messageVotes.delete()
                                    })
                                })

                            }
                            )
                        }

                    })




                })
                //SortdFormatedRowsPromise
            })

            //voteArgs.message.channel.send(pages)

        }
    } catch (interactionerrorvote) {
        console.error(interactionerrorvote);
    }
}

export async function showTopVoters(voteArgs: showTopVotersArgs) {
    var leaderboard = {}

    var totalStats = {
        "discordbotlist": 0,
        "topgg": 0,
        "topggmtd": 0
    }

    const options = { prepare: true, fetchSize: 1000 };

    //schema 
    //time timeuuid PRIMARY KEY, voteservice text, userid text

    //var query = "SELECT * from adoravotes.votes";
    //var params = []

    var today = new Date()
    var priorDate = new Date().setDate(today.getDate() - 30)
    const id2 = TimeUuid.fromDate(new Date(priorDate));
    var query = "SELECT * from adoravotes.votes WHERE time >= ? ALLOW FILTERING";
    var params = [id2]

    var lastVoteTimeForReqUserTopgg = 0
    var lastVoteTimeForReqUserDbl = 0
    var authorid = voteArgs.message.author.id;

    const result = await cassandraclient.execute(query, params, { prepare: true });

    for await (const row of result) {
        console.log(row.userid);

        if (row.userid === authorid) {
            console.log('found author id in req');
            await logger.discordInfoLogger.info("found author in req", { type: "debugvote" });
            if (row.voteservice == "topgg") {
                if (lastVoteTimeForReqUserTopgg < row.time.getDate().getTime()) {
                    lastVoteTimeForReqUserTopgg = row.time.getDate().getTime();
                }
            }
            if (row.voteservice == "discordbotlist") {
                if (lastVoteTimeForReqUserDbl < row.time.getDate().getTime()) {
                    lastVoteTimeForReqUserDbl = row.time.getDate().getTime();
                }
            }
        }

        console.log(row.voteservice);
        totalStats[`${row.voteservice}`] += 1;

        var firstDateOfMonthUTC = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth()));

        if (row.voteservice === 'topgg' && row.time.getDate() > firstDateOfMonthUTC) {
            totalStats['topggmtd'] += 1;
        }

        // process row
        // Invoked per each row in all the pages
        var userid = row.userid
        console.log(userid)

        if (!(leaderboard[userid] === undefined)) {
            //add to the number
            console.log("it's already in here")
            leaderboard[userid] = leaderboard[userid] + 1
        } else {
            leaderboard[userid] = 1
        }
    }

    // emitted when all rows have been retrieved and read

    console.log(leaderboard)

    if (_.size(leaderboard) === 0) {
        voteArgs.message.reply("No one has voted yet! Try voting with `a!vote`")
    } else {
        console.log("presorted")
        console.log(leaderboard)
        var sortedLeaderboard = sortObject(leaderboard);
        console.log("post-sorted")
        console.log(sortedLeaderboard)

        //reverse the order os it's most votes at tehe top
        sortedLeaderboard = sortedLeaderboard.reverse()

        //sortedLeaderboard = sortedLeaderboard.slice(0, 100);

        /* const sortedLeaderboardPromise = await sortedLeaderboard.map(async (eachUser) => {
     
             console.log(eachUser)
     
             var userResults = voteArgs.client.users.fetch(eachUser.key, true, true).then(async (user) => {
                 console.log(user)
                 return {id: eachUser.key, user: user, votes: eachUser.value}})
             .catch((error) => {return {id: eachUser.id, error: error}})
     
             return userResults
     
         })*/

        const sortedLeaderboardPromise = await Promise.all(sortedLeaderboard.map(async (eachUser) => {
            console.log(eachUser)

            var userResults = await voteArgs.client.users.fetch(eachUser.key, true, true).then(async (user) => {
                console.log(user)
                return { id: eachUser.key, user: user, votes: eachUser.value }
            })
                .catch((error) => { return { id: eachUser.id, error: error } })

            return userResults
        }));

        console.log(sortedLeaderboardPromise);

        Promise.all(sortedLeaderboardPromise).then(async (sortedLeaderboard) => {



            console.log(sortedLeaderboard)

            sortedLeaderboard = sortedLeaderboard.filter(eachuser => (!(eachuser.error)));

            var totalNumberOfUsers = _.size(sortedLeaderboard)

            sortedLeaderboard = sortedLeaderboard.slice(0, 1000);

            const sortedFormattedRowsPromise = sortedLeaderboard.map(async (eachUser, index) => {

                console.log("map out: " + index)
                console.log(eachUser)
                //var avatarURL = await eachUser.user.displayAvatarURL();
                //return {
                //   "title": `#${index + 1} - ${eachUser.user.tag}`,
                //     "description": `${eachUser.votes} Votes`
                //}

                return `\`#${index + 1}\`|\`${eachUser.votes} votes\` ${eachUser.user.username}`

            })

            Promise.all(sortedFormattedRowsPromise).then(async (sortedFormatedRows) => {
                console.log("second promise")
                var currentPage: string = "";
                var currentPageStage: string = "";
                var pages: Array<string> = []

                console.log(sortedFormatedRows)

                /*forEach(sortedFormatedRows, function (eachFormattedRow, indexOfRow) {
                    console.log(eachFormattedRow)
                    currentPageStage = currentPageStage + eachFormattedRow + "\n";
            
                    console.log("currentPageStage")
                    console.log(currentPageStage)
            
                    // logger.discordInfoLogger.info("key is " + key + " array size is " + charts.length)
                
                     if(currentPageStage.length > 1500 || (indexOfRow != sortedFormatedRows.length-1)) {
                         //write currentpagestage to currentpage
                       // logger.discordInfoLogger.info({type: "billboardChartListTest", message: "currentPageStage.length < 2000"})
                        
                     } else {
                        console.log("Last block")
                        //if(key === ) {
                
                         //}
                         currentPageStage = eachFormattedRow + "\n";
                         pages.push(currentPageStage)
                        //logger.discordInfoLogger.info({type: "billboardChartListTest", message: "currentPageStage.length >= 2000"})
                     }    
            
                    });*/

                pages = splitMessage(sortedFormatedRows.join("\n"), { maxLength: 1500 })

                console.log(pages)

                var twelvehours = 12 * 60 * 60 * 1000

                var voteAskString = "Your Next Vote Times:"

                await logger.discordInfoLogger.info("top gg time is " + lastVoteTimeForReqUserTopgg + "dbl is" +
                    lastVoteTimeForReqUserDbl, { type: "debugvote" });

                //format next time to vote
                if (lastVoteTimeForReqUserTopgg < Date.now() - twelvehours) {
                    voteAskString += "\nTop.gg: Now! :white_check_mark:\nhttps://top.gg/bot/737046643974733845/vote"
                } else {
                    var nextVoteUnixTopgg = Math.round((lastVoteTimeForReqUserTopgg + twelvehours) / 1000)
                    voteAskString += `\nTop.gg: <t:${nextVoteUnixTopgg}:R>\n <t:${nextVoteUnixTopgg}:d> <t:${nextVoteUnixTopgg}:T>`
                }

                //format next time to vote
                if (lastVoteTimeForReqUserDbl < Date.now() - twelvehours) {
                    voteAskString += "\nDBL: Now! :white_check_mark:\nhttps://discordbotlist.com/bots/adora-ahelp/upvote"
                } else {
                    var nextVoteUnixDbl = Math.round((lastVoteTimeForReqUserDbl + twelvehours) / 1000)
                    voteAskString += `\nDBL: <t:${nextVoteUnixDbl}:R>\n <t:${nextVoteUnixDbl}:d> <t:${nextVoteUnixDbl}:T>`
                }

                const pageEmbedArray = await pages.map((page, pageindex) => {

                    //var descForPage = page
                    var messageMap = {
                        "content": `Vote for Adora with \`/vote\` to show up on the leaderboard!\n${voteAskString}`,
                        "embeds": [{
                            "description": page,
                            "title": `Top Voters (past 30 days)`,
                            "footer": {
                                "text": `Anonymized for privacy reasons.\nPage ${pageindex + 1} out of ${pages.length} pages.`
                            },
                            "fields": [
                                {
                                    "name": "Top.gg votes",
                                    "value": `${totalStats.topgg}`,
                                    "inline": true
                                },
                                {
                                    "name": "Top.gg votes this month (actual ranking)",
                                    "value": `${totalStats.topggmtd}`,
                                    "inline": true
                                },
                                {
                                    "name": "Discordbotlist votes",
                                    "value": `${totalStats.discordbotlist}`
                                }
                            ]
                        }]
                    }

                    return messageMap;
                }

                )

                console.log('pageEmbedArray')
                console.log(pageEmbedArray)
                //console.log(pageEmbedArray[0].embeds)

                var pageCounter = 0;

                voteArgs.message.reply(pageEmbedArray[pageCounter]).then(async (messageVotes: Message) => {
                    if (pages.length != 1) {
                        messageVotes.react('⬅').then(r => {
                            messageVotes.react('➡').then(r => {
                                messageVotes.react("🗑")

                                // Filters
                                const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === voteArgs.message.author.id
                                const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === voteArgs.message.author.id
                                const deleteFilter = (reaction, user) => reaction.emoji.name === '🗑' && user.id === voteArgs.message.author.id

                                const timeOfTimer = 60 * 60 * 1000
                                const backwards = messageVotes.createReactionCollector({ filter: backwardsFilter, time: timeOfTimer })
                                const forwards = messageVotes.createReactionCollector({ filter: forwardsFilter, time: timeOfTimer })
                                const deleteCollector = messageVotes.createReactionCollector({ filter: deleteFilter, time: timeOfTimer })

                                backwards.on('collect', (r, u) => {
                                    if (pageCounter === 0) {
                                        pageCounter = pages.length - 1
                                    } else {
                                        pageCounter--
                                    }
                                    messageVotes.edit(pageEmbedArray[pageCounter])
                                    r.users.remove(r.users.cache.filter(u => u === voteArgs.message.author).first())
                                })

                                forwards.on('collect', (r, u) => {
                                    if (pageCounter === pageEmbedArray.length - 1) {
                                        pageCounter = 0;
                                    } else {
                                        pageCounter++
                                    }
                                    messageVotes.edit(pageEmbedArray[pageCounter])
                                    r.users.remove(r.users.cache.filter(u => u === voteArgs.message.author).first())
                                })

                                deleteCollector.on('collect', (r, u) => {
                                    messageVotes.delete()
                                })
                            })

                        }
                        )
                    }

                })

            })
            //SortdFormatedRowsPromise
        })

        //voteArgs.message.channel.send(pages)

    }


}
