import { CommandInteraction, Interaction, ReactionCollector } from 'discord.js'
import { ytparty } from './discordTogether';
import { geniusLyricsFromInteraction } from './genius';
import { logger, tracer, span } from './logger'
import { ping, pingInteraction } from './ping'
import { mamaAwards2021Interaction } from './get2021mamavoteinfo'
import { billboardinteraction } from './billboard'
import {interactionautoban} from './interactionautoban'
import {bankickinteraction} from './bankickinteraction'
import {helppageinteraction} from './help'
const { config } = require('./../../config.json');


import { youtubeVideoStatsInteraction } from './youtube/youtube'
import { inspectInteraction } from './inspect';

interface processInteractionType {
  interaction: any;
  [key: string]: any;
}

export async function processInteraction(args: processInteractionType) {
  try {

    const interaction = args.interaction
    if (interaction.isCommand) {

      const expr = interaction.commandName;
      switch (expr) {
        case 'ping':
          await pingInteraction(interaction, interaction.client)
          break;
        case 'invite':
          interaction.reply("Here's the invite link! It's an honor to help you :) \n" + 
        "https://discord.com/oauth2/authorize?client_id=737046643974733845&scope=bot%20applications.commands&permissions=2151017550"+
        "\nHere's our support server for announcements and questions! Subscribe to the announcements channel for updates. https://discord.gg/3h6dpyzHk7\nRemember to run `/help` for the list of commands!")
        case 'lyrics':
          await geniusLyricsFromInteraction(interaction)
        case 'yt':
          await youtubeVideoStatsInteraction(interaction, config)
        case 'ytparty':
          //await geniusLyricsFromInteraction(interaction)
          await ytparty({ message: interaction, client: args.interaction.client })
        case 'billboard':
          await billboardinteraction(interaction, args.interaction.client)
        case 'ban':
          bankickinteraction(interaction)
        case 'autoban':
          await interactionautoban(interaction)
        case 'unban':
          bankickinteraction(interaction)
        case 'kick':
          bankickinteraction(interaction)
        case 'inspect':
          await inspectInteraction(interaction)
        case 'help':
          await helppageinteraction(interaction)
        case 'mama':
          // await mamaAwards2021Interaction(interaction) 
          await interaction.reply('The 2021 Mama Awards Votes have ended. Come back next year!')
          break;
        default:
        // console.log(`Sorry, we are out of ${expr}.`);
          await interaction.reply("Command not found")
      }
    }


    var interactionLogger: any = {
      "command": interaction.commandName,
      "authorname": interaction.user.tag,
      "type": 'interactioncreate'
    }

    if (interaction.guild) {
      interactionLogger["guildName"] = interaction.guild.name;
      interactionLogger["guildId"] = interaction.guildId;
    }

    if (interaction.isCommand()) {
      interactionLogger['commandOptions'] = interaction.options.data
    }

    await logger.discordInfoLogger.info(interactionLogger);
    
    await logger.discordDebugLogger.debug(interactionLogger);


    //await logger.discordElasticLogger.info(`${JSON.stringify(interaction), {'type': 'interactionCreate'}}`)
  } catch (interactionerror) {
    logger.discordErrorLogger.error(interactionerror, { type: 'interactionerror' })


  }



}