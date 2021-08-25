import { DiscordInteractions } from "slash-commands";
const { config } = require('./../config.json');

var testingguild = "440286077261971477"

const interaction = new DiscordInteractions({
  applicationId: config.clientid,
  authToken: config.token,
  publicKey: config.publickey,
});

async function deleteCommands() {
// Get Guild Commands
await interaction
  .getApplicationCommands(testingguild)
  .then(console.log)
  .catch(console.error);

  //878754922013806633
  // Delete Guild Command
await interaction
.deleteApplicationCommand("878754922013806633", testingguild)
.then(console.log)
.catch(console.error);

await interaction
  .getApplicationCommands(testingguild)
  .then(console.log)
  .catch(console.error);
}

deleteCommands()

