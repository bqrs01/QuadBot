exports.run = async (client, message, args, level) => {
    const rawChannel = args.slice(-1).pop()
    const members = message.mentions.members

    const guild = message.channel.guild
    const voiceChannel = await guild.channels.cache.find(ch => ch.name == rawChannel)

    if (voiceChannel) {
        ranALOnce = false
        members.each(user => {
            ranALOnce = true;
            let voiceState = user.voice
            if (voiceState.channel && user.presence.status !== "offline") {
                voiceState.setChannel(voiceChannel)
            } else {
                client.sendDisappearingMessage(`${message.member}, user ${user} is not online!`, message.channel, 4)
            }
        })
        // If not run at least once
        if (!ranALOnce) return client.sendDisappearingMessage(`${message.member}, no users were mentioned. Try again!`, message.channel, 4)
    } else {
        client.sendDisappearingMessage(`${message.member}, channel ${rawChannel} doesn't exist!`, message.channel, 4)
    }
}

exports.conf = {
    enabled: true,
    aliases: ['m'],
    permLevel: "4"
};

exports.help = {
    name: "move",
    category: "Miscelaneous",
    description: "It like... Pings. Then Pongs. And it's not Ping Pong.",
    usage: "move"
};