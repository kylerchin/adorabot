
var testserver = '861845585282596874'

import { DiscordInteractions } from "slash-commands";
const { config } = require('./../config.json');


const interaction = new DiscordInteractions({
  applicationId: config.clientid,
  authToken: config.token,
  publicKey: config.publickey,
});

const commands = [{
  "name": "lyrics",
  "description": "Lookup a song's lyrics",
  "options": [
    {
      "type": 3,
      "name": "song",
      "description": "The name of the song, artist, or album",
      "required": true
    }
]}]; 


async function createCommands() {
// Create Global Command

commands.forEach(async command => {
  await interaction
.createApplicationCommand(command, testserver)
.then(console.log)
.catch(console.error);
}
)

}

createCommands()