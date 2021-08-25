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
  name: "youtube",
  description: ""
}];


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