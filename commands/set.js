exports.run = async (client, message, [action, key, ...value], level) => { // eslint-disable-line no-unused-vars

    // Retrieve current guild settings (merged) and overrides only.
    const settings = message.settings;
    const defaults = client.settings.get("default");
    const overrides = client.settings.get(message.guild.id);
    if (!client.settings.has(message.guild.id)) client.settings.set(message.guild.id, {});

    // Edit an existing key value
    if (action === "edit") {
        // User must specify a key.
        if (!key) return client.sendDisappearingMessage("Please specify a key to edit", message.channel, 4);
        // User must specify a key that actually exists!
        if (!defaults[key]) return client.sendDisappearingMessage("This key does not exist in the settings", message.channel, 4);
        const joinedValue = value.join(" ");
        // User must specify a value to change.
        if (joinedValue.length < 1) return client.sendDisappearingMessage("Please specify a new value", message.channel, 4);
        // User must specify a different value than the current one.
        if (joinedValue === settings[key]) return client.sendDisappearingMessage("This setting already has that value!", message.channel, 4);

        // If the guild does not have any overrides, initialize it.
        if (!client.settings.has(message.guild.id)) client.settings.set(message.guild.id, {});

        // Modify the guild overrides directly.
        client.settings.set(message.guild.id, joinedValue, key);

        // Confirm everything is fine!
        client.sendDisappearingMessage(`${key} successfully edited to ${joinedValue}`, message.channel, 4);
    } else

        // Resets a key to the default value
        if (action === "del" || action === "reset") {
            if (!key) return client.sendDisappearingMessage("Please specify a key to reset.", message.channel, 4);
            if (!defaults[key]) return client.sendDisappearingMessage("This key does not exist in the settings", message.channel, 4);
            if (!overrides[key]) return client.sendDisappearingMessage("This key does not have an override and is already using defaults.", message.channel, 4);

            // Good demonstration of the custom awaitReply method in `./modules/functions.js` !
            const response = await client.awaitReply(message, `Are you sure you want to reset ${key} to the default value?`);

            // If they respond with y or yes, continue.
            if (["y", "yes"].includes(response.toLowerCase())) {
                // We delete the `key` here.
                client.settings.delete(message.guild.id, key);
                client.sendDisappearingMessage(`${key} was successfully reset to default.`, message.channel, 4);
            } else
                // If they respond with n or no, we inform them that the action has been cancelled.
                if (["n", "no", "cancel"].includes(response)) {
                    client.sendDisappearingMessage(`Your setting for \`${key}\` remains at \`${settings[key]}\``, message.channel, 4);
                }
        } else

    if (action === "get") {
        if (!key) return client.sendDisappearingMessage("Please specify a key to view", message.channel, 4);
        if (!defaults[key]) return client.sendDisappearingMessage("This key does not exist in the settings", message.channel, 4);
        const isDefault = !overrides[key] ? "\nThis is the default global default value." : "";
        client.sendDisappearingMessage(`The value of ${key} is currently ${settings[key]}${isDefault}`, message.channel, 4);
    } else {
        // Otherwise, the default action is to return the whole configuration;
        const array = [];
        Object.entries(settings).forEach(([key, value]) => {
            array.push(`${key}${" ".repeat(20 - key.length)}::  ${value}`);
        });
        await message.channel.send(`= Current Guild Settings =\n${array.join("\n")}`, {
            code: "asciidoc"
        });
    }
};


exports.conf = {
    enabled: true,
    aliases: ['s'],
    permLevel: "5"
};

exports.help = {
    name: "set",
    category: "Config",
    description: "",
    usage: "set"
};