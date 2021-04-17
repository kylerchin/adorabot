const { listCharts,getChart } = require('billboard-top-100');
var forEach = require("for-each")
const Discord = require('discord.js');

export async function billboardChartsHelpPage(message,command,args) {
    
}

export async function billboardListChartsScrollable(message,command,args) {

    var pages = []

    await listCharts(async (err, charts)=> {
        if (err) console.log(err);
        console.log(charts); // prints array of all charts

        await forEach(charts, function (eachChart) {
        
        var chartCode = eachChart.url.replace("http://www.billboard.com/charts/", "")
        
        //message.channel.send(chartCode)

        pages.push(chartCode)

        })
      });

            let page = 1 
    
            const embed = new Discord.MessageEmbed() // Define a new embed
            .setColor(0xffffff) // Set the color
            .setFooter(`Page ${page} of ${pages.length}`)
            .setDescription(pages[page-1])
    
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
}

export async function billboardCharts(message,command,args) {
    if(args.length < 1) {
        await billboardChartsHelpPage(message,command,args)
    }
    
    if(args[0] === "list" || args[0] === "listchart" || args[0] === "listcharts" || args[0] === 'charts') {
        billboardListChartsScrollable(message,command,args)
    }
}