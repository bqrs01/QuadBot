// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

// Load up the discord.js library
const Discord = require("discord.js");
// We also load the rest of the things we need in this file:
const {
  promisify
} = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");

// Used to enable 'pending' flag for Member Screening on Discord.js v12.
Discord.Structures.extend('GuildMember', GuildMember => {
  class GuildMemberWithPending extends GuildMember {
      pending = false;
  
      constructor(client, data, guild) {
          super(client, data, guild);
          this.pending = data.pending || false;
      }
  
      _patch(data) {
          super._patch(data);
          this.pending = data.pending || false;
      }
  }
  return GuildMemberWithPending;
});

// Discord client
const client = new Discord.Client();

// Get secret
client.config = require("./secrets.json");

// Require our logger
client.logger = require("./logger");

// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.
require("./functions.js")(client);

// Now we integrate the use of Evie's awesome EnMap module, which
// essentially saves a collection to disk. This is great for per-server configs,
// and makes things extremely easy for this purpose.
client.settings = new Enmap({
  name: "settings"
});

//console.log(client.getSettings())

// Aliases and commands are put in collections where they can be read from,
// catalogued, listed, etc.
client.commands = new Enmap();
client.aliases = new Enmap();
client.modules = new Enmap();

const init = async () => {
  // Here we load **commands** into memory, as a collection, so they're accessible
  // here and everywhere else.
  const cmdFiles = await readdir("./commands/");
  client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });

  // Then we load events, which will include our message and ready event.
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    client.logger.log(`Loading Event: ${eventName}`);
    const event = require(`./events/${file}`);
    // Bind the client to any event, before the existing arguments
    // provided by the discord.js event. 
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
  });

  const modFolders = await readdir("./modules/");
  client.logger.log(`Attempting to load a total of ${modFolders.length} modules.`)
  modFolders.forEach(async modFolder => {
    const response = await client.loadModule(modFolder)
    if (response) console.log(response);
  });

  // Here we login the client.
  await client.login(client.config.token);
}

init()