const {
    promisify
} = require("util");
const readdir = promisify(require("fs").readdir);

module.exports = (client) => {
    // Enmap settings
    const defaultSettings = {
        "prefix": "!",
        "adminRole": "admin",
        "memberRole": "member",
        "superAdminId": "178157279839911936"
    }

    client.sendDisappearingMessage = async (message, channel, time) => {
        const messageO = await channel.send(message)
        setTimeout(async () => {
            messageO.delete()
        }, time * 1000)
        return messageO
    }

    client.getUserIdFromMention = (mention) => {
        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<@!?(\d+)>$/);

        // If supplied variable was not a mention, matches will be null instead of an array.
        if (!matches) return;

        // However the first element in the matches array will be the entire mention, not just the ID,
        // so use index 1.
        const id = matches[1];

        return id;
        //return client.users.cache.get(id);
    }

    // getSettings merges the client defaults with the guild settings. guild settings in
    // enmap should only have *unique* overrides that are different from defaults.
    client.getSettings = (guild) => {
        client.settings.ensure("default", defaultSettings);
        if (!guild) return client.settings.get("default");
        const guildConf = client.settings.get(guild.id) || {};
        // This "..." thing is the "Spread Operator". It's awesome!
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        return ({
            ...client.settings.get("default"),
            ...guildConf
        });
    };

    client.loadModule = async (moduleName) => {
        try {
            const module = require(`./modules/${moduleName}/`)
            if (!module.props.enabled) return false;
            client.logger.log(`Loading module: ${moduleName}`);
            module.initData = null;
            if (module.init) {
                const init = module.init(client);
                if (init) module.initData = init;
            }
            client.modules.set(module.props.name, module)

            // Load module events as well
            const moduleEvents = await readdir(`./modules/${moduleName}/events/`);
            client.logger.log(`Loading a total of ${moduleEvents.length} events found in module ${moduleName}.`);
            moduleEvents.forEach(file => {
                const eventName = file.split(".")[0];
                //client.logger.log(`Loading Event: ${eventName}`);
                const event = require(`./modules/${moduleName}/events/${file}`);
                // Bind the client to any event, before the existing arguments
                // provided by the discord.js event. 
                // This line is awesome by the way. Just sayin'.
                client.on(eventName, event.bind(null, client, module.initData));
            });

            return false;
        } catch (e) {
            return `Unable to load module ${moduleName}: ${e.stack}`;
        }
    }

    client.loadCommand = (commandName) => {
        try {
            client.logger.log(`Loading command: ${commandName}`);
            const props = require(`./commands/${commandName}`);
            if (props.init) {
                props.init(client);
            }
            client.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    };

    client.unloadCommand = async (commandName) => {
        let command;
        if (client.commands.has(commandName)) {
            command = client.commands.get(commandName);
        } else if (client.aliases.has(commandName)) {
            command = client.commands.get(client.aliases.get(commandName));
        }
        if (!command) return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;

        if (command.shutdown) {
            await command.shutdown(client);
        }
        const mod = require.cache[require.resolve(`./commands/${command.help.name}`)];
        delete require.cache[require.resolve(`./commands/${command.help.name}.js`)];
        for (let i = 0; i < mod.parent.children.length; i++) {
            if (mod.parent.children[i] === mod) {
                mod.parent.children.splice(i, 1);
                break;
            }
        }
        return false;
    };

    // let mainMessageId = ""
    client.mainMessageId = ""

    client.voiceChannelRegistrations = {}

    client.permlevel = (message) => {
        const settings = client.getSettings(message.guild);
        const userRole = message.member.roles.highest
        const userRoleName = userRole.name
        const userId = message.member.id

        if (userId == settings.superAdminId) return 5;
        if (userRoleName == settings.adminRole || message.member.hasPermission(8)) return 4;
        if (userRoleName == settings.memberRole) return 3;

        return 2;
    }

    client.awaitReply = async (msg, question, limit = 60000) => {
        const filter = m => m.author.id === msg.author.id;
        await client.sendDisappearingMessage(question, msg.channel, 20);
        try {
            const collected = await msg.channel.awaitMessages(filter, {
                max: 1,
                time: limit,
                errors: ["time"]
            });
            return collected.first().content;
        } catch (e) {
            return false;
        }
    };

    client.getRoleFromPermLevel = (perm) => {
        switch (perm) {
            case 5:
                return 'superadmin'
            case 4:
                return 'admin'
            case 3:
                return 'member'
            default:
                return 'user'
        }
    }

    // These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
    process.on("uncaughtException", (err) => {
        const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
        client.logger.error(`Uncaught Exception: ${errorMsg}`);
        console.error(err);
        // Always best practice to let the code crash on uncaught exceptions. 
        // Because you should be catching them anyway.
        process.exit(1);
    });

    process.on("unhandledRejection", err => {
        client.logger.error(`Unhandled rejection: ${err}`);
        console.error(err);
    });

}