import { logger } from "./logger";

const { listCharts,getChart } = require('billboard-top-100');
var forEach = require("for-each")
const Discord = require('discord.js');

export async function billboardChartsHelpPage(message,command,args) {
    
}

export async function billboardListChartsScrollable(message,command,args) {

    var pages = []

    await listCharts((err, charts)=> {
        if (err) console.log(err);
       // console.log(charts); // prints array of all charts

        var currentPage:string = "";
        var currentPageStage:string = "";


        forEach(charts, function (eachChart, key) {
        
        var chartCode = eachChart.url.replace("http://www.billboard.com/charts/", "")
        
        currentPageStage = currentPageStage + chartCode + "\n";

       // logger.discordInfoLogger.info("key is " + key + " array size is " + charts.length)

        if(currentPageStage.length < 1000 && (key != 180-1)) {
            //write currentpagestage to currentpage
          // logger.discordInfoLogger.info({type: "billboardChartListTest", message: "currentPageStage.length < 2000"})
            currentPage = currentPageStage;
        } else {
           
           //if(key === ) {

            //}
            currentPageStage = chartCode + "\n";
            pages.push("`"  + currentPage + "`")
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
          .setColor(0xffffff) // Set the color
          .setFooter(`Page ${page} of ${pages.length}`)
          .setDescription(pages[page-1])
          .setTitle("Billboard List of Charts")
  
          message.channel.send({embed}).then(messageBillboardEmbed => {
            messageBillboardEmbed.react('⬅').then( r => {
              messageBillboardEmbed.react('➡')
  
              // Filters
              const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id
              const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id
  
              const backwards = messageBillboardEmbed.createReactionCollector(backwardsFilter, {timer: 60000})
              const forwards = messageBillboardEmbed.createReactionCollector(forwardsFilter, {timer: 60000})
  
              backwards.on('collect', (r, u) => {
                  if (page === 1) return r.users.remove(r.users.cache.filter(u => u === message.author).first())
                  page--
                  embed.setDescription(pages[page-1])
                  embed.setFooter(`Page ${page} of ${pages.length}`)
                  messageBillboardEmbed.edit(embed)
                  r.users.remove(r.users.cache.filter(u => u === message.author).first())
              })
  
              forwards.on('collect', (r, u) => {
                  if (page === pages.length) return r.users.remove(r.users.cache.filter(u => u === message.author).first())
                  page++
                  embed.setDescription(pages[page-1])
                  embed.setFooter(`Page ${page} of ${pages.length}`)
                  messageBillboardEmbed.edit(embed)
                  r.users.remove(r.users.cache.filter(u => u === message.author).first())
              })
            })
          })
    });
    

      
}

export async function billboardCharts(message,command,args,client) {
    if(args.length < 1) {
        await billboardChartsHelpPage(message,command,args)
    }
    
    if(args[0] === "list" || args[0] === "listchart" || args[0] === "listcharts" || args[0] === 'charts') {
        billboardListChartsScrollable(message,command,args)
    } else {
        getChart(args[0], async (err, chart) => {
            console.log(chart)
            console.log(chart.songs)
            if (err) console.log(err);
            //message.channel.send(chart.week)
            
            const webhooks = await message.channel.fetchWebhooks();
            const webhooksArray = webhooks.array();
            console.log(webhooks)

            var webhookToUse;
            if (webhooksArray === 0) {
                //no webhooks, make one
                await message.channel.createWebhook('Adora', {
                    avatar: client.user.displayAvatarURL(),
                })
                    .then(webhook => {console.log(`Created webhook ${webhook}`);
                    webhookToUse = webhook;
                })
                    .catch(console.error);
            } else {
                webhookToUse = await webhooks.first();
            }

            const embed = new Discord.MessageEmbed()
            .setTitle('Webhooks')
            .setColor('#0099ff');

            console.log(webhookToUse)

            await webhookToUse.send('Adora Webhook', {
                username: 'Adora Bot',
                avatarURL: 'client.user.displayAvatarURL()',
                embeds: [embed],
            });

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
          });
    }
}