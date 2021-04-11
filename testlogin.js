const { config } = require('./config.json');

const Discord = require('discord.js');
var client = new Discord.Client({ intents: Discord.Intents.NON_PRIVILEGED, retryLimit: Infinity});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client
  .on("debug", console.log)
  .on("warn", console.log)

client.login(config.token);