const {
    moduleData,
    voiceRegistrations
} = require('../')
module.exports = async (client, _, message) => {
    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Grab the settings for this server from Enmap.
    // If there is no guild, get default conf (DMs)
    const settings = message.settings = client.getSettings(message.guild);

    let inBotSC = false;

    const setups = moduleData.get('setups')

    for (let key in setups) {
        if (!setups.hasOwnProperty(key)) continue;
        // Check if in any textChannel
        if (message.channel.id == setups[key].textChannelId) {
            inBotSC = true;
        }
    }

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    if (message.content.indexOf(settings.prefix) !== 0) {
        if (inBotSC) {
            client.sendDisappearingMessage(`${message.member}, This channel is only for \`quadbot\` commands!`, message.channel, 6)
            message.delete()
        }
        return
    }

    // Delete message to reduce spam
    //message.delete()

    // Here we separate our "command" name, and our "arguments" for the command.
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // If the member on a guild is invisible or not cached, fetch them.
    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    // Get the user or member's permission level from the elevation
    const level = client.permlevel(message);

    switch (command) {
        case 'join':
            if (!inBotSC) return client.sendDisappearingMessage(`${message.member}, \`join\` only works in the configured channel`, message.channel, 6);
            if (!args[0]) return client.sendDisappearingMessage(`${message.member}, you're missing the channel number`, message.channel, 4)
            // To simplify message arguments, the author's level is now put on level (not member so it is supported in DMs)
            // The "level" command module argument will be deprecated in the future.
            message.author.permLevel = level;

            if (level < 3) return false;

            message.flags = [];
            while (args[0] && args[0][0] === "-") {
                message.flags.push(args.shift().slice(1));
            }
            // If the command exists, **AND** the user has permission, run it.
            client.logger.cmd(`[CMD] ${client.getRoleFromPermLevel(level)} ${message.author.username} (${message.author.id}) ran command join [JoinVoice]`);

            // Check if guild has setup
            const setup = moduleData.get('setups', message.guild.id)
            if (!setup) return client.sendDisappearingMessage(`${message.member}, this server hasn't been setup for join yet!`, message.channel, 4)

            const index = parseInt(args[0])

            const voiceState = (message.member.voice)

            if (index < 1 || index > setup.voiceChannels.length) return client.sendDisappearingMessage(`${message.member}, invalid choice. Try again!`, message.channel, 6)
            if (!voiceState.channelID) return client.sendDisappearingMessage(`${message.member}, you need to join the voice channel first!`, message.channel, 6)

            // Join code goes here:
            voiceRegistrations.set(message.guild.id, `${(index)-1}`, message.member.id)

            const voiceChannel = await client.channels.fetch(setup.joinVoiceChannelId)

            voiceState.setChannel(voiceChannel)

            return client.sendDisappearingMessage(`${message.member}, successfully joined you to ${setup.voiceChannels[index-1].name}!`, message.channel, 6)
        default:
            return false;
    }
}