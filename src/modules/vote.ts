var _ = require('lodash');
var forEach = require('for-each')
import { Message } from 'discord.js'
var Discord = require('discord.js')

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
    arr.sort(function(a, b) { return a.value - b.value; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
}

export function sendVoteLinks(message: Message) {
    message.reply("Vote at https://top.gg/bot/737046643974733845/vote\nTop Voters are viewed with `a!votes`")
}

interface showTopVotersArgs {
    cassandraclient: any;
    message: Message;
    [key:string]: any;
    client: any;
}

export async function showTopVoters(voteArgs:showTopVotersArgs) {
    var leaderboard = {}

    const options = { prepare : true , fetchSize : 1000 };

    //schema 
    //time timeuuid PRIMARY KEY, voteservice text, userid text

    var query = "SELECT * from adoravotes.votes";
    var parameters = []
  
 await voteArgs.cassandraclient.stream(query, parameters, options)
  .on('readable', function () {
    // readable is emitted as soon a row is received and parsed
    let row;
    while (row = this.read()) {
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
  })
  .on('end', async function () {
    // emitted when all rows have been retrieved and read

    console.log(leaderboard)

if(_.size(leaderboard) === 0) {
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

    const sortedLeaderboardPromise = await sortedLeaderboard.map(async (eachUser) => {

        console.log(eachUser)

        var userResults = await voteArgs.client.users.fetch(eachUser.key, true, true).then(async (user) => {
            console.log(user)
            return {id: eachUser.key, user: user, votes: eachUser.value}})
        .catch((error) => {return {id: eachUser.id, error: error}})

        return userResults

    })

    Promise.all(sortedLeaderboardPromise).then(async(sortedLeaderboard) => {
        
    

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

        return `\`#${index+1}\`|\`${eachUser.votes} votes\` ${eachUser.user.username}`
        
    })

    Promise.all(sortedFormattedRowsPromise).then(async (sortedFormatedRows) => {
        console.log("second promise")
        var currentPage:string = "";
    var currentPageStage:string = "";
    var pages:Array<string> = []

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

        pages = Discord.splitMessage(sortedFormatedRows.join("\n"), {maxLength: 1500})

        console.log(pages)

        const pageEmbedArray = pages.map((page,pageindex) => {
            return {
                "content": "Vote for Adora with `a!vote` to show up on the leaderboard!",
                "embeds": [{
                "description": page,
                "title": `Top Voters | Page ${pageindex + 1} out of ${pages.length} pages.`,
                "footer": {
                    "text": `Anonymized for privacy reasons.`
                }
            }]
        }})

        console.log('pageEmbedArray')
        console.log(pageEmbedArray)
        //console.log(pageEmbedArray[0].embeds)

        var pageCounter = 0;

        voteArgs.message.channel.send(pageEmbedArray[pageCounter]).then(async (messageVotes: Message) => {
            messageVotes.react('⬅').then( r => {
                messageVotes.react('➡').then( r => {
                  messageVotes.react("🗑")

                    // Filters
          const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === voteArgs.message.author.id
          const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === voteArgs.message.author.id
          const deleteFilter = (reaction, user) => reaction.emoji.name === '🗑' && user.id === voteArgs.message.author.id

                  const timeOfTimer = 60*60*1000
          const backwards = messageVotes.createReactionCollector(backwardsFilter, {time: timeOfTimer})
          const forwards = messageVotes.createReactionCollector(forwardsFilter, {time: timeOfTimer})
          const deleteCollector = messageVotes.createReactionCollector(deleteFilter, {time: timeOfTimer})

            backwards.on('collect', (r, u) => {
                if (pageCounter === 0) {
                    pageCounter = pages.length-1
                } else {
                    pageCounter--
                }
                messageVotes.edit(pageEmbedArray[pageCounter])
                r.users.remove(r.users.cache.filter(u => u === voteArgs.message.author).first())
            })

            forwards.on('collect', (r, u) => {
                if (pageCounter === pageEmbedArray.length-1) {
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

                })})
        })        
        //SortdFormatedRowsPromise
    })

    //voteArgs.message.channel.send(pages)
    
}
  });

}