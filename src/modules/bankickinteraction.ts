
var forEach = require("for-each")

import { uniq } from './util'
import { Client, Message, Guild, CommandInteraction } from 'discord.js'

export async function bankickinteraction(interaction:CommandInteraction) {

    if (interaction.guild) {
        //transforms the user id list into a list to be banned
        //this line prevents accidental role mentions from being added
        var roleMentionsRemoved = interaction.options.getString('users').replace(/<@&(\d{18})>/g, '')

        var arrayOfUserIdsToLookup = uniq(roleMentionsRemoved.match(/(?<!\d)\d{18}(?!\d)/g));

        var embeds = []

        interaction.reply(`Performed action on ${arrayOfUserIdsToLookup.length} users...`)

        var reason = ""

        if (interaction.options.getString('reason')) {
            reason = interaction.options.getString('reason')
        } 

        const arrayOfActionsPromisesMapped = arrayOfUserIdsToLookup.map(banID => {

            if (interaction.commandName === 'ban') {

                var banOptionsObject:any = {
                    reason: reason
                }
                if (interaction.options.getBoolean('purgemsgs') === true) {
                    banOptionsObject.days = 7
                } 
                
                return interaction.guild.members.ban(banID, banOptionsObject)
            }

            if (interaction.commandName === 'unban') {

                var banOptionsObject:any = {
                    reason: reason
                }
                
                return interaction.guild.members.unban(banID, banOptionsObject)
            }

            if (interaction.commandName === 'kick') {

                var banOptionsObject:any = {
                    reason: reason
                }
                
                return interaction.guild.members.unban(banID, banOptionsObject)
            }

            
        });

        Promise.all(arrayOfActionsPromisesMapped).then(values => {
            console.log(values); // [3, 1337, "foo"]
            forEach(values, async (promisecontent) => {
                console.log(promisecontent)
                // logger.discordInfoLogger.info(`Banned ${user.username || user.id || user} from ${message.guild.name}`, { userObject: user })
            })
        });

    } else {
        interaction.reply("this only works in servers. Please try again.")
    }
     
}