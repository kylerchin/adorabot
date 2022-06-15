import { DiscordInteractions } from "slash-commands";
const { config } = require('./../config.json');


const interaction = new DiscordInteractions({
  applicationId: config.clientid,
  authToken: config.token,
  publicKey: config.publickey,
});

const commands = [
  /*{
  name: "ping",
  description: "View bot latency."
},
{
  "name": "lyrics",
  "description": "Lookup a song's lyrics",
  "options": [
    {
      "type": 3,
      "name": "song",
      "description": "The name of the song, artist, album, and/or a line in a song",
      "required": true
    }
]},
{
  "name": "yt",
  "description": "YouTube View Count Tracker with Graphs",
  "options": [
    {
      "type": 3,
      "name": "search-or-url",
      "description": "The search query or URL of a YouTube video",
      "required": true
    }
]},
{
  "name": "ytparty",
  "description": "Start a YouTube watch party in a voice channel"
},
{
  "name": "mama",
  "description": "View Real-Time Charts for MAMA Awards 2021: Worldwide Fans’ Choice TOP 10"
},
{
  "name": "billboard",
  "description": "View latest & historical Billboard Charts",
  "options": [
    {
      "type": 3,
      "name": "chart",
      "description": "Chart ID like \"hot100\" or \"kpop\", put \"list\" for a list of possible chart ids.",
      "required": true
    },
    {
      "type": 3,
      "name": "date",
      "description": "Optional Date for Historical charts. \"YYYY-MM-DD\" format, dashes required"
    }
  ]
},*/
{
  "name": "ban",
  "description": "Bans users, only works in server for users with ban perms",
  "options": [
    {
      "type": 3,
      "name": "bans",
      "description": "Insert 1 or more userids and/or mentions to ban",
      "required": true
    },
    {
      "type": 5,
      "name": "purgemsgs",
      "description": "If enabled, deletes messages in this server from the users"
    }
  ]
},
{
  "name": "unban",
  "description": "Unbans users, only works in server for users with ban perms",
  "options": [
    {
      "type": 3,
      "name": "unbans",
      "description": "Insert 1 or more userids and/or mentions to unban",
      "required": true
    }
  ]
},
{
  "name": "kick",
  "description": "Kick users, only works in server for users with kick perms",
  "options": [
    {
      "type": 3,
      "name": "kick",
      "description": "Insert 1 or more userids and/or mentions to kick",
      "required": true
    }
  ]
},
{
  "name": "autoban",
  "description": "Autoban known banlisted raid accounts before they come to your server. /autoban help for info",
  "options": [
    {
      "type": 1,
      "name": "on",
      "description": "Enables Autoban on this server"
    },
    {
      "type": 1,
      "name": "off",
      "description": "Disables Autoban on this server"
    },
    {
      "type": 1,
      "name": "help",
      "description": "About Adora's automated banlist & status for this server"
    }
  ]
},
/*
{
  "name": "inspect",
  "description": "Shows info of user like Flags, Account creation time, Banlist status, and icon!",
  "options": [
    {
      "type": 3,
      "name": "bans",
      "description": "Insert 1 or more userids and/or mentions to inspect",
      "required": true
    },
  ]
}*/
];


async function createCommands() {
// Create Global Command

commands.forEach(async command => {
  await interaction
.createApplicationCommand(command)
.then((output:any) => {
  console.log(output);
  if (output.errors) {
    console.error(output.errors)
    if (output.errors.description._errors) {
      console.error(output.errors.description._errors)
    }
  }
})
.catch(console.error);
}
)

}

createCommands()