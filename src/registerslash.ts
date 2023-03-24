import { DiscordInteractions } from "slash-commands";
const { config } = require('./../config.json');


const interaction = new DiscordInteractions({
  applicationId: config.clientid,
  authToken: config.token,
  publicKey: config.publickey,
});

const commands = [
  /*
  {
  name: "ping",
  "name_localizations": {
    "ko": "핑"
  },
  description: "View bot latency."
},
{
  "name": "lyrics",
  "name_localizations": {
    "ko": "가사"
  },
  "description": "Lookup a song's lyrics",
  "options": [
    {
      "type": 3,
      "name": "search",
      "name_localizations": {
        "ko": "검색"
      },
      "description": "The name of the song, artist, album, and/or a line in a song",
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
},*/
/*
{
  "name": "billboard",
  "name_localizations": {
    "ko": "빌보드"
  },
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
},
*/
/*
{
  "name": "ban",
  "description": "Bans users, only works in server for users with ban perms",
  "options": [
    {
      "type": 3,
      "name": "users",
      "description": "Insert 1 or more userids and/or mentions to ban",
      "required": true
    },
    {
      "type": 5,
      "name": "purgemsgs",
      "description": "If enabled, deletes messages in this server from the users"
    },
    {
      "type": 3,
      "name": "reason",
      "description": "Reason for ban",
      "required": false
    }
  ]
},
{
  "name": "unban",
  "description": "Unbans users, only works in server for users with ban perms",
  "options": [
    {
      "type": 3,
      "name": "users",
      "description": "Insert 1 or more userids and/or mentions to unban",
      "required": true
    },
    {
      "type": 3,
      "name": "reason",
      "description": "Reason for unban",
      "required": false
    }
  ]
},
{
  "name": "kick",
  "description": "Kick users, only works in server for users with kick perms",
  "options": [
    {
      "type": 3,
      "name": "users",
      "description": "Insert 1 or more userids and/or mentions to kick",
      "required": true
    },
    {
      "type": 3,
      "name": "reason",
      "description": "Reason for kick",
      "required": false
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
{
  "name": "inspect",
  "description": "Shows info of user like Flags, Account creation time, Banlist status, and icon!",
  "options": [
    {
      "type": 3,
      "name": "users",
      "description": "Insert 1 or more userids and/or mentions to inspect",
      "required": true
    },
  ]
}*/
/*
{
  "name": "yt",
  "name_localizations": {
    "ko": "유튜브"
  },
  "description": "YouTube View Count Tracker with Graphs",
  "description_localizations": {
    "ko": "유튜브 조회수 추적기 및 그래프"
  },
  "options": [
    {
      "type": 3,
      "name": "search-or-url",
      "description": "The search query or URL of a YouTube video",
      "required": true,
      "name_localizations": {
        "ko": "검색-또는-링크"
      },
      "description_localizations": {
        "ko": "유튜브 동영상의 검색어 또는 링크"
      }
    }
]},*/
/*
{
  "name": "help",
  "description": "List of commands on Adora bot",
},*/

{
  "name": "vote",
  "name_localizations": {
    "ko": "투표"
  },
  "description": "Vote for Adora bot!",
},
/*
{
  "name": "votes",
  "description": "View your place on the voting leaderboard!",
},*/
/*
{
  "name": "stats",
  "description": "Adora Bot Statistics and Info",
},*/
/*
{
  "name": "invite",
  "description": "Invite Adora bot to your own server + Link to Adora support server",
},*/
];


async function createCommands() {
// Create Global Command

commands.forEach(async command => {
  await interaction
.createApplicationCommand(command)
.then((output:any) => {
  console.log(output);
 
    console.error(JSON.stringify(output.errors))
   
})
.catch(console.error);
}
)

}

createCommands()