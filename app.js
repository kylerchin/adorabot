"use strict";
/*
    The following code goes into it's own file, and you run this file
    instead of your main bot file.
*/
exports.__esModule = true;
// Include discord.js ShardingManger
var ShardingManager = require('discord.js').ShardingManager;
var config = require('./config.json').config;
// Create your ShardingManger instance
var manager = new ShardingManager('./adora.js', {
    // for ShardingManager options see:
    // https://discord.js.org/#/docs/main/v12/class/ShardingManager
    totalShards: 'auto',
    token: config.token
});
// Spawn your shards
manager.spawn();
// Emitted when a shard is created
manager.on('shardCreate', function (shard) { return console.log("Shard " + shard.id + " launched"); });
