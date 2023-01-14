
import { CommandInteraction, Interaction, ReactionCollector } from 'discord.js';
import {cassandraclient} from './cassandraclient'

export function botstatsinteraction(interaction: CommandInteraction) {
    //await howManyUsersInBanDatabase(cassandraclient)

    const queryNumberOfSubscribedServers = "SELECT COUNT(*) FROM adoramoderation.guildssubscribedtoautoban WHERE subscribed= ? ALLOW FILTERING;"
    const parametersForSubscribedServers = [true]
    const lookuphowmanybannedusersquery = "SELECT COUNT(*) FROM adoramoderation.banneduserlist;"
    const lookuphowmanyphishinglinks = "SELECT COUNT(*) FROM adoramoderation.badlinks;"
    const lookuphowmanyytvidstracked = "SELECT COUNT(*) FROM adorastats.trackedytvideosids;"
    const lookuphowmanyytvidsstats = "SELECT * FROM adorastats.statpoints;"
    //return numberofrowsindatabase;

    const client = interaction.client

    const promises = [
        client.shard.fetchClientValues('guilds.cache.size'),
        client.shard.broadcastEval(client => client.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)),
        cassandraclient.execute(queryNumberOfSubscribedServers, parametersForSubscribedServers),
        cassandraclient.execute(lookuphowmanybannedusersquery),
        cassandraclient.execute(lookuphowmanyphishinglinks),
        cassandraclient.execute(lookuphowmanyytvidstracked),
        cassandraclient.execute(lookuphowmanyytvidsstats)
    ];

    return Promise.all(promises)
        .then(results => {
            console.log(results[6])

            const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
            const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);
            var returnSubscribedServersCount = results[2];
            var subscribedServerCount = returnSubscribedServersCount.rows[0].count.low
            var returnBanDatabaseAmount = results[3];
            var numberofrowsindatabase = returnBanDatabaseAmount.rows[0].count.low
            var numberofrowsphishing = results[4].rows[0].count.low
            var numberofrowsytvids = results[5].rows[0].count.low
            var numberofrowsytstats = results[6].rows[0].amount
            var bob = `Bot Statistics`
            interaction.reply({
                embeds: [{
                    description: bob, "fields": [
                        {
                            "name": "Servers",
                            "value": `${totalGuilds}`
                        },
                        {
                            "name": "Members",
                            "value": `${totalMembers}`
                        },
                        {
                            "name": "Shards",
                            "value": `${client.shard.count}`
                        },
                        {
                            "name": "Bans in Database",
                            "value": `${numberofrowsindatabase}`,
                            "inline": true
                        },
                        {
                            "name": "Servers Subscribed to Autoban",
                            "value": `${subscribedServerCount}`,
                            "inline": true
                        },
                        {
                            "name": "Phishing links blocked",
                            "value": `${numberofrowsphishing}`
                        }
                    ]
                },
                {
                    "fields": [
                        {
                            "name": "Tracked YouTube Videos",
                            "value": `${numberofrowsytvids}`,
                            "inline": true
                        },
                        {
                            "name": "Video Statistic Points",
                            "value": `${numberofrowsytstats}`,
                            "inline": true
                        }
                    ]
                }]
            })
                .catch(console.error);

            return true;


        }).catch((error) => {
            console.error(error)
        })
}