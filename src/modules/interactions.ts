import {CommandInteraction, Interaction, ReactionCollector} from 'discord.js'
import { geniusLyricsFromInteraction } from './genius';
import { logger } from './logger'
import { ping, pingInteraction } from './ping'

export async function processInteraction(args) {
  logger.discordInfoLogger.info({type:'interactionCreate',interaction:args.interaction})
 if (args.interaction.isCommand) {

  const expr = args.interaction.commandName;
switch (expr) {
  case 'ping':
    await pingInteraction(args.interaction, args.client)
    break;
  case 'lyrics':
    await geniusLyricsFromInteraction(args.interaction)
    // expected output: "Mangoes and papayas are $2.79 a pound."
    break;
  default:
   // console.log(`Sorry, we are out of ${expr}.`);
}

 }
}