/*
    The following code goes into it's own file, and you run this file
    instead of your main bot file.
*/

// Include discord.js ShardingManger
//const { ShardingManager } = require('discord.js');
import {ShardingManager} from 'discord.js'
const { config } = require('./../config.json');
import {} from "./adora"; 
import {logger,tracer} from './modules/logger'
//import {keepAlive} from './server'

//keepAlive()

//import "dd-trace/init";
/*
Sentry.init({
    dsn: config.sentry.dsn,
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  
  const transaction = Sentry.startTransaction({
    op: "test",
    name: "My First Test Transaction",
  });
  
  setTimeout(() => {
    try {
      throw new Error;
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      transaction.finish();
    }
  }, 99);*/
  

// Create your ShardingManger instance
const manager = new ShardingManager('./dist/adora.js', {
    // for ShardingManager options see:
    // https://discord.js.org/#/docs/main/v12/class/ShardingManager
    totalShards: 'auto',
    token: config.token
});

// Emitted when a shard is created
manager.on('shardCreate',async (shard) => {
    console.log(`Shard ${shard.id} launched`);
    //logger.discordInfoLogger.info({type: "shardCreate", shard: shard});
});

// Spawn your shards
manager.spawn().catch(async (error) => {
  //await logger.discordErrorLogger.error({type: "shardCreateError", error: error});
});