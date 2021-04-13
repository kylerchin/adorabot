const { listCharts,getChart } = require('billboard-top-100');
var forEach = require("for-each")
const Discord = require('discord.js');

export async function billboardChartsHelpPage(message,command,args) {
    
}

export async function billboardListChartsScrollable(message,command,args) {
    await listCharts(async (err, charts)=> {
        if (err) console.log(err);
        console.log(charts); // prints array of all charts

        await forEach(charts, function (eachChart) {
        
        var chartCode = eachChart.url.replace("http://www.billboard.com/charts/", "")
        
        //message.channel.send(chartCode)

        })
      });

      let pages = [
        'Page 1', // 0
        'Page 2', // 1
        'Page 3' // 2
    ];

    let current = 0;
    let m = await message.channel.send('Loading pages...');

    function createEmbed (page) {
        let embed = new Discord.MessageEmbed()
        .setDescription(pages[page]);
        return embed;
    };

    function reactionsNeeded (page) {
        return [
            pages[page - 1],
            pages[page + 1]
        ];
    };

    async function showPage (page) {
        let output = createEmbed(page);
        await m.edit(null, { embed: output });
        await m.reactions.removeAll();

        let needed = reactionsNeeded(page);
        let left, right;

        if (needed[0]) {
            await m.react('⬅️');

            let filter = (r, u) => r.emoji.name == '⬅️' && u.id == message.author.id;
            left = m.createReactionCollector(filter, { time: 60000 });

            left.on('collect', (r) => {
                if (right) right.stop();
                left.stop();

                showPage(current - 1);
                current = current - 1;
            });
        };

        if (needed[1]) {
            await m.react('➡️');

            let filter = (r, u) => r.emoji.name == '➡️' && u.id == message.author.id;
            right = m.createReactionCollector(filter, { time: 60000 });

            right.on('collect', (r) => {
                if (left) left.stop();
                right.stop();

                showPage(current + 1);
                current = current + 1;
            });
        };
    };

    showPage(current);
}

export async function billboardCharts(message,command,args) {
    if(args.length < 1) {
        await billboardChartsHelpPage(message,command,args)
    }
    
    if(args[0] === "list" || args[0] === "listchart" || args[0] === "listcharts" || args[0] === 'charts') {
        billboardListChartsScrollable(message,command,args)
    }
}