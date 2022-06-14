import { DiscordInteractions } from "slash-commands";
const { config } = require('./../config.json');


const interaction = new DiscordInteractions({
  applicationId: config.clientid,
  authToken: config.token,
  publicKey: config.publickey,
});

const commands = [{
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
}
];


async function createCommands() {
// Create Global Command

commands.forEach(async command => {
  await interaction
.createApplicationCommand(command)
.then(console.log)
.catch(console.error);
}
)

}

createCommands()