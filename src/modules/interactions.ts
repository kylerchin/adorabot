import {CommandInteraction, Interaction, ReactionCollector} from 'discord.js'
import { logger } from './logger'
import { ping, pingInteraction } from './ping'

export async function processInteraction(args) {
  logger.discordInfoLogger.info({type:'interactionCreate',interaction:args.interaction})
 if (args.interaction.isCommand) {

    if (args.interaction.commandName === 'ping') {
        await pingInteraction(args.interaction, args.client)
      }
 }
}