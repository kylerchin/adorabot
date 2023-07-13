import fetch from 'node-fetch';

import { CommandInteraction, Interaction, ReactionCollector } from 'discord.js'
import { ytparty } from './discordTogether';
import { geniusLyricsFromInteraction } from './genius';
import { logger, tracer, span } from './logger'
import {botstatsinteraction} from './botstatsinteraction'
import { ping, pingInteraction } from './ping'
import { mamaAwards2021Interaction } from './get2021mamavoteinfo'
import { billboardinteraction } from './billboard'
import {interactionautoban} from './interactionautoban'
import {bankickinteraction} from './bankickinteraction'
import {helppageinteraction} from './help'
import { showTopVotersInteraction} from './vote'
import { replyorfollowup } from './replyorfollowup';
const { config } = require('./../../config.json');

import {uploadStringToNewRelic} from './newRelic';
import { youtubeVideoStatsInteraction } from './youtube/youtube'
import { inspectInteraction } from './inspect';
import { sendVoteLinks } from './vote';
import { youtubeVideoButtonInteraction } from './youtube/youtube';

interface processInteractionType {
  interaction: any;
  [key: string]: any;
}

export async function processInteraction(args: processInteractionType) {
 //log only if new relic log api exists
  try {
    const interaction = args.interaction;

    console.log('interaction triggered by ', interaction.username, ' ', interaction.id)

    if (interaction.isButton()) {
      console.log(`${interaction.id} is button`);

      if (interaction.isRepliable()) {
        console.log(`${interaction.id} is button & repliable`);

          if (interaction.customId.startsWith("repeatytv|")) {
            youtubeVideoButtonInteraction(interaction, config);
          }
      }
    }

    if (interaction.isCommand()) {

      const expr = interaction.commandName;
      switch (expr) {
        case 'ping':
          await pingInteraction(interaction, interaction.client)
          break;
        case 'invite':
          interaction.reply("Here's the invite link! It's an honor to help you :) \n" + 
        "https://discord.com/oauth2/authorize?client_id=737046643974733845&scope=bot%20applications.commands&permissions=2151017550"+
        "\nHere's our support server for announcements and questions! Subscribe to the announcements channel for updates. https://discord.gg/3h6dpyzHk7\nRemember to run `/help` for the list of commands!")
          break;
        case 'lyrics':
          await geniusLyricsFromInteraction(interaction)
          break;
        case 'yt':
          await youtubeVideoStatsInteraction(interaction, config)
          break;
        case 'ytparty':
          //await geniusLyricsFromInteraction(interaction)
          await ytparty({ message: interaction, client: args.interaction.client })
          break;
        case 'billboard':
         // await billboardinteraction(interaction, args.interaction.client)
         break;
        case 'ban':
          bankickinteraction(interaction)
          break;
        case 'autoban':
          await interactionautoban(interaction)
          break;
        case 'stats': 
          await botstatsinteraction(interaction);
          break;
        case 'unban':
          bankickinteraction(interaction)
          break;
        case 'kick':
          bankickinteraction(interaction)
          
          break;
        case 'inspect':
          await inspectInteraction(interaction);
          break;
        case 'help':
          await helppageinteraction(interaction);
          break;
        case 'vote':
          sendVoteLinks(interaction);
        case 'votes':
          showTopVotersInteraction({
              interaction,
              client: args.interaction.client
          });
          break;
        case 'mama':
           //await mamaAwards2021Interaction(interaction) 
          await interaction.reply('The 2022 Mama Awards Votes have ended. Come back next year!')
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


    try {
      
      await replyorfollowup({
        messageorinteraction: interaction,
        content:"**MAJOR SECURITY BREACH!**\nHi! I'm Kyler Chin, the creator of Adora. My discord was hacked. However, it appears that adora is okay? Maybe? I'm not sure. If you are an Adora User (especially who I talk to), please DM me at @kyler.chin on Instagram. In the meantime, don't trust any messages or DMs coming from the hacked account. Turn on 2fa, don't click on sus links. Stay safe, I love y'all! See you soon."});

      console.log('WARNED about hack');
    } catch (e) {
      console.error(e);
    }

    //await logger.discordElasticLogger.info(`${JSON.stringify(interaction), {'type': 'interactionCreate'}}`)
  } catch (interactionerror) {
    logger.discordErrorLogger.error(interactionerror, { type: 'interactionerror' })


  }



}