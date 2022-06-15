import { CommandInteraction, Interaction, ReactionCollector } from 'discord.js'
import { ytparty } from './discordTogether';
import { geniusLyricsFromInteraction } from './genius';
import { logger, tracer, span } from './logger'
import { ping, pingInteraction } from './ping'
import { mamaAwards2021Interaction } from './get2021mamavoteinfo'
import { billboardinteraction } from './billboard'
import {interactionautoban} from './interactionautoban'
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
          await interaction.reply("feature in development")
        case 'autoban':
          await interactionautoban(interaction)
        case 'unban':
          await interaction.reply("feature in development")
        case 'kick':
          await interaction.reply("feature in development")
        case 'inspect':
          await inspectInteraction(interaction)
        case 'mama':
          // await mamaAwards2021Interaction(interaction) 
          await interaction.reply('The 2021 Mama Awards Votes have ended. Come back next year!')
          break;
        default:
        // console.log(`Sorry, we are out of ${expr}.`);
      }
    }


    var interactionLogger: any = {
      "interaction": interaction,
      "authorname": interaction.user.tag,
      "type": 'interactioncreate'
    }

    if (args.interaction.inGuild()) {
      interactionLogger["guildName"] = interaction.guild.name;
      interactionLogger["guildId"] = interaction.guildId;
    }

    if (interaction.isCommand()) {
      interactionLogger['commandOptions'] = interaction.options.data
    }

    await logger.discordInfoLogger.info(interactionLogger)


    //await logger.discordElasticLogger.info(`${JSON.stringify(interaction), {'type': 'interactionCreate'}}`)
  } catch (interactionerror) {
    logger.discordErrorLogger.error(interactionerror, { type: 'interactionerror' })


  }



}