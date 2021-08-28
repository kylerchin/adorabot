const Discord = require('discord.js');
var startupTime = Date.now()
var recievedFirstMessageState:boolean = false;
var elapsedTimeFirstMsg;
const client = new Discord.Client(
    { 
        partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
        intents: ['GUILDS',"GUILD_BANS","GUILD_EMOJIS_AND_STICKERS","GUILD_WEBHOOKS","GUILD_MESSAGES","DIRECT_MESSAGES","GUILD_MESSAGE_REACTIONS","DIRECT_MESSAGE_REACTIONS"]
      }
);
const { config } = require('./../config.json');

client.on('ready', () => {
  console.log('I am ready!');
});


client.on('messageCreate', message => {


  if (recievedFirstMessageState === false) {
    recievedFirstMessageState = true;

     elapsedTimeFirstMsg = Date.now() - startupTime
    console.log(`First message in ${elapsedTimeFirstMsg}ms`)
    //logger.discordInfoLogger.info(`First message in ${elapsedTimeFirstMsg}ms`)
  }

  if (message.content === 'a!ping') {
    message.channel.send('pong');
  }
});

client.on("debug", console.log)
      .on("warn", console.log)

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(config.token);