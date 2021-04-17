/*
    The following code goes into it's own file, and you run this file
    instead of your main bot file.
*/

// Include discord.js ShardingManger
const { ShardingManager } = require('discord.js');
const { config } = require('./config.json');
import {} from "./adora"; 
import {logger} from './modules/logger'

// Create your ShardingManger instance
const manager = new ShardingManager('./adora.js', {
    // for ShardingManager options see:
    // https://discord.js.org/#/docs/main/v12/class/ShardingManager
    totalShards: 'auto',
    token: config.token
});

// Spawn your shards
manager.spawn();

// Emitted when a shard is created
manager.on('shardCreate',async (shard) => {
    console.log(`Shard ${shard.id} launched`);
    await logger.discordInfoLogger.info({type: "shardCreate", shard: shard});
});