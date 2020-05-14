exports.run = async (client, message, args, level) => {
    const rawId = args[0]
    const rawChannel = args[1]
    const userId = client.getUserIdFromMention(rawId)

    const guild = message.channel.guild
    const user = await guild.members.fetch(userId)
    const voiceState = user.voice

    const voiceChannel = await guild.channels.cache.find(ch => ch.name == rawChannel)

    if (voiceChannel) {
        if (voiceState.channel && user.presence.status !== "offline") {
            voiceState.setChannel(voiceChannel)
        } else {
            client.sendDisappearingMessage(`${message.member}, user ${user} is not online!`, message.channel, 4)
        }
    } else {
        client.sendDisappearingMessage(`<@${message.member.id}>, channel ${rawChannel} doesn't exist!`, message.channel, 4)
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