import {CommandInteraction, Interaction, ReactionCollector} from 'discord.js'
import { geniusLyricsFromInteraction } from './genius';
import { logger,tracer,span } from './logger'
import { ping, pingInteraction } from './ping'

interface processInteractionType {
  interaction: any;
  [key: string]: any;
}

export async function processInteraction(args:processInteractionType) {
  const interaction = args.interaction
 if (interaction.isCommand) {

  const expr = interaction.commandName;
switch (expr) {
  case 'ping':
    await pingInteraction(interaction, interaction.client)
    break;
  case 'lyrics':
    await geniusLyricsFromInteraction(interaction)
    // expected output: "Mangoes and papayas are $2.79 a pound."
    break;
  default:
   // console.log(`Sorry, we are out of ${expr}.`);
}

 }

 await logger.discordInfoLogger.info({
   "interaction": args.interaction,
   "type": 'interactionCreate'
 })

 await logger.discordElasticLogger.info(`${JSON.stringify(interaction), {'type': 'interactionCreate'}}`)
}