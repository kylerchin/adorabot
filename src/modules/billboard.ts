import { logger } from "./logger";

const { listCharts,getChart } = require('billboard-top-100');
var forEach = require("for-each")
const Discord = require('discord.js');
import {ReactionCollectorOptions,CollectorFilter} from 'discord.js'
var _ = require('lodash')
import {Message} from 'discord.js'
import {hexCodeToColorNumber} from './util'
const { config } = require('./../../config.json');

var chartShortObject = {}

export async function listChartsDownload() {
  await listCharts((err, charts)=> {
    forEach(charts, function (eachChart) {
  
      var chartcode = eachChart.url.replace("http://www.billboard.com/charts/", "")
      var shortCode = officialToAdoraBBcode(chartcode)
      chartShortObject[`${shortCode}`] = chartcode
      chartShortObject[chartcode] = chartcode
      var evenShorter = chartcode.toString().replace(/-/g,'')
      chartShortObject[evenShorter] = chartcode
  
      var doubleshort = shortCode.toString().replace(/-/g,'')
      chartShortObject[doubleshort] = chartcode
    })
    //logger.discordInfoLogger.info({message: chartShortObject, type: "chartShortArrayFinished"})
  })
}

async function sendChartScrollable(chart,message: Message,err,chartCode) {
    //console.log(chart)
    //console.log(chart.songs)
    if (err) console.log(err);
    //message.channel.send(chart.week)

    const arrayOfEmbeds = chart.songs.map((song) => {
        
        console.log(song)
        var embedObject = { 
            "title": `#${song.rank} - ${song.title}`,
           /* "author": {
                //"name": song.artist
                "name": `#${ song.rank}`
            },*/
            "thumbnail": {
                "url": song.cover
            },
            "description": `${song.artist}`,
            "fields": [
                {
                    "name": "Weeks on Chart",
                    "value": `${song.position.weeksOnChart} weeks`,
                    "inline": true
                },
                {
                    "name": "Peak Position",
                    "value": `#${song.position.peakPosition}`,
                    "inline": true
                },
                {
                    "name": "Position Last Week",
                    "value": `#${song.position.positionLastWeek}`,
                    "inline": true
                }
            ]
        }

        

        return embedObject;
    })

    var groupedEmbeds = _.chunk(arrayOfEmbeds, 10);

    groupedEmbeds = groupedEmbeds.map((eachChunk, index) => {
        var eachChunkFixed = eachChunk
        eachChunkFixed[eachChunkFixed.length-1].footer = {
            "text": `Page ${index + 1} of ${groupedEmbeds.length} | Billboard`
        }
        return eachChunkFixed;
    })

    logger.discordInfoLogger.info(chart, {type: "billboardChart"})

    var pageCounter = 0;
    message.channel.send({
      "content": `${chartCode} Chart | ${chart.week}`,
      embeds: groupedEmbeds[pageCounter]}).then(messageBillboardEmbed => {

      //  message.channel.stopTyping();

        console.log("finished part 1")
    

            console.log("finished part 1")

          // Filters
          const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id
          const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id
          const deleteFilter = (reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id

          const timeOfTimer = 60*60*1000
          const backwards = messageBillboardEmbed.createReactionCollector({filter: backwardsFilter, time: timeOfTimer})
          const forwards = messageBillboardEmbed.createReactionCollector({filter: forwardsFilter, time: timeOfTimer})
          const deleteCollector = messageBillboardEmbed.createReactionCollector({filter: deleteFilter, time: timeOfTimer})

          backwards.on('collect', (r, u) => {
              if (pageCounter === 0) {
                pageCounter = groupedEmbeds.length-1
              } else {
                pageCounter--
              }
              messageBillboardEmbed.edit({embeds: groupedEmbeds[pageCounter]})
              r.users.remove(r.users.cache.filter(u => u === message.author).first())
          })

          forwards.on('collect', (r, u) => {
              if (pageCounter === groupedEmbeds.length-1) {
                pageCounter = 0;
              } else {
                pageCounter++
              }
              messageBillboardEmbed.edit({embeds: groupedEmbeds[pageCounter]})
              r.users.remove(r.users.cache.filter(u => u === message.author).first())
          })

          deleteCollector.on('collect', (r, u) => {
            messageBillboardEmbed.delete()
          })
          
          messageBillboardEmbed.react('⬅').then( r => {
            messageBillboardEmbed.react('➡').then( r => {
              messageBillboardEmbed.react("🗑")
            })
          })

      })
        

    // prints the week of the chart in the date format YYYY-MM-DD
    //message.channel.send(chart.previousWeek.url) // prints the URL of the previous week's chart
    //message.channel.send(chart.previousWeek.date) // prints the date of the previous week's chart in the date format YYYY-MM-DD
    //message.channel.send(chart.nextWeek.url) // prints the URL of the next week's chart
    //message.channel.send(chart.nextWeek.date) // prints the date of the next week's chart in the date format YYYY-MM-DD
    logger.discordInfoLogger.info(chart.songs, {type: "billboard-top-100-testing"}); // prints array of top 100 songs for week of August 27, 2016
   // message.channel.send(chart.songs[3]); // prints song with rank: 4 for week of August 27, 2016
    //message.channel.send(chart.songs[0].title); // prints title of top song for week of August 27, 2016
    //message.channel.send(chart.songs[0].artist); // prints artist of top songs for week of August 27, 2016
    //message.channel.send(chart.songs[0].rank) // prints rank of top song (1) for week of August 27, 2016
    //message.channel.send(chart.songs[0].cover) // prints URL for Billboard cover image of top song for week of August 27, 2016
}

export async function billboardChartsHelpPage(message,command,args) {
    message.channel.send({embeds: [{
        "title": "Billboard Charts Help Page",
        "color": hexCodeToColorNumber('#eebcbb'),
        "description": "Shows latest and historical information on Billboard charts",
        "fields": [
          {
            "name": "List of Charts",
            "value": "`a!billboard list` will retrieve a list of possible chart codes."
          },
          {
            "name": "Getting latest Chart information",
            "value": "`a!bilboard <chart> [optional YYYY-MM-DD]`\nFor example, `a!billboard hot-100` will get the latest Hot-100 songs.\n`a!billboard korea-100` will get the latest Hot Korean songs.\n`a!billboard hot-100 2016-08-27` retrieves the Hot-100 chart from Aug 27, 2016.\nWhen typing a chart code, you can omit the dashes and that will work too! `a!bb korea100` will be the same as `a!bb korea-100`"
          },
          {
            "name": "Alias",
            "value": "`a!bb` is the same command as `a!billboard`"
          }
        ]
      }]})
}

export function officialToAdoraBBcode(chartname: string) {
  const regex = /billboards?-?/g
  return chartname.toString().replace(regex,"")
}

export function adoraToOfficialBBcode(chartname) {
  console.log(chartShortObject)
  console.log(`long code for ${chartname}: ` + chartShortObject[`${chartname}`])
    return chartShortObject[`${chartname}`]
}

export async function billboardListChartsScrollable(message,command,args) {

    var pages = []

    await listCharts((err, charts)=> {
        if (err) return logger.discordErrorLogger.error(err);
       // console.log(charts); // prints array of all charts

        var currentPage:string = "";
        var currentPageStage:string = "";


        forEach(charts, function (eachChart, key) {
        
        var chartCode = eachChart.url.replace("http://www.billboard.com/charts/", "")

        chartCode = officialToAdoraBBcode(chartCode)
        
        currentPageStage = currentPageStage + chartCode + "\n";

       // logger.discordInfoLogger.info("key is " + key + " array size is " + charts.length)

        if(currentPageStage.length < 1000 && (key != charts.length-1)) {
            //write currentpagestage to currentpage
          // logger.discordInfoLogger.info({type: "billboardChartListTest", message: "currentPageStage.length < 2000"})
            currentPage = currentPageStage;
        } else {
           
           //if(key === ) {

            //}
            currentPageStage = chartCode + "\n";
           // pages.push("`"  + currentPage + "`")
           pages.push( currentPage )
           //logger.discordInfoLogger.info({type: "billboardChartListTest", message: "currentPageStage.length >= 2000"})
        }

     //   logger.discordInfoLogger.info({type: "billboardChartListTest", pages: pages})



        //message.channel.send(chartCode)

        //pages.push(chartCode)

       //return true;

        });

        console.log(pages)

          let page = 1 
  
          const embed = new Discord.MessageEmbed() // Define a new embed
          .setColor(0xe7acc2) // Set the color
          .setFooter(`Page ${page} of ${pages.length}`)
          .setDescription(pages[page-1])
          .setTitle("Billboard List of Charts")
  
          var messageToSendBillboard = {
            embeds: [embed]}

          message.channel.send(messageToSendBillboard).then((messageBillboardEmbed: Message) => {
  
              // Filters
              const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id
              const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id
  
              const timeOfTimer = 60*60*1000
              const backwards = messageBillboardEmbed.createReactionCollector({filter: backwardsFilter, time: timeOfTimer})
              const forwards = messageBillboardEmbed.createReactionCollector({filter: forwardsFilter, time: timeOfTimer})
  
              backwards.on('collect', (r, u) => {
                  if (page === 1) {
                    page = pages.length
                  } else {
                    page--
                  }
                  embed.setDescription(pages[page-1])
                  embed.setFooter(`Page ${page} of ${pages.length}`)
                  messageBillboardEmbed.edit({embeds: [embed]})
                  r.users.remove(r.users.cache.filter(u => u === message.author).first())
              })
  
              forwards.on('collect', (r, u) => {
                  if (page === pages.length) {
                    page = 1;
                  } else {
                      page++
                  }
                  embed.setDescription(pages[page-1])
                  embed.setFooter(`Page ${page} of ${pages.length}`)
                  messageBillboardEmbed.edit({embeds: [embed]})
                  r.users.remove(r.users.cache.filter(u => u === message.author).first())
              })
            

              messageBillboardEmbed.react('⬅').then( r => {
                messageBillboardEmbed.react('➡')
              })
          })
    });
        
}

export async function billboardCharts(message,command,args,client) {
    const searchString = message.content.trim().replace(config.token,"").replace(/a!/g,"").trim().replace(command,"").replace(/ /gm,"").trim()
    message.reply(`searching for \`${searchString}\``)
    if(args.length < 1 || args[0] === "help") {
        await billboardChartsHelpPage(message,command,args)
    } else 
  {
    if (args[0] === "testcode") {
      var chartCodeProcessed = adoraToOfficialBBcode(args[1])
      message.reply(chartCodeProcessed)
    } else {
      if(args[0] === "list" || args[0] === "listchart" || args[0] === "listcharts" || args[0] === 'charts') {
        billboardListChartsScrollable(message,command,args)
    } else {
      //message.channel.send("The billboard command is currently unstable. Certain pages may not work and we are working on an update. We apologize for the inconvenience\n Join the Adora Support Server via `a!invite` to get updates on when a fix will be delivered! ")

      var chartCodeProcessed = adoraToOfficialBBcode(searchString)

      if(typeof(chartCodeProcessed) === "undefined") {
        message.channel.send("Invalid chart, use `a!bb list` to see a full list of valid chart")
        billboardChartsHelpPage(message,command,args)
       // message.channel.stopTyping();
      } else {
         // Start typing in a channel, or increase the typing count by one
         message.channel.sendTyping();
         if(args[1]) {
             getChart(chartCodeProcessed, args[1], async (err, chart) => {
                 sendChartScrollable(chart,message,err,chartCodeProcessed)
               })
         } else {
             getChart(chartCodeProcessed, async (err, chart) => {
               console.log(chart)
                 sendChartScrollable(chart,message,err,chartCodeProcessed)
               })
         }
      }
       
    }
    } 
  }

      
}