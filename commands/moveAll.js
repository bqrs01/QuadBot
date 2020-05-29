const {
    GuildMember
} = require('discord.js')

const delay = (amount = number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, amount);
    });
}

exports.run = async (client, message, args, level) => {
    const rawChannel = args[0] || '<not specified>'

    const guild = message.channel.guild

    let voiceChannel = await guild.channels.cache.find(ch => ch.name == rawChannel)

    if (voiceChannel || rawChannel == 'null') {
        if (rawChannel == 'null') voiceChannel = null;
        await guild.members.fetch()
        let a = -1
        let membersMoved = 0
        const members = guild.members.cache.filter(us => ((us.presence.status != "offline" || us.voice.channel != null) && !us.user.bot))
        await members.forEach(async member => {
            if (member instanceof GuildMember) {
                const voiceState = member.voice
                if (voiceState.channel) {
                    a++
                    await delay(250 + (a * 200))
                    membersMoved++
                    await voiceState.setChannel(voiceChannel).catch((error) => {
                        //console.log('Failed to move', member.nickname)
                        console.log('noyolo', error)
                        return false;
                    })
                }
            }
        })

        await delay(1000)
        if (rawChannel == 'null') {
            client.sendDisappearingMessage(`<@${message.member.id}>, disconnected ${membersMoved} users!`, message.channel, 4)
        } else {
            client.sendDisappearingMessage(`<@${message.member.id}>, moved ${membersMoved} users into ${rawChannel}!`, message.channel, 4)
        }
    } else {
        client.sendDisappearingMessage(`<@${message.member.id}>, channel ${rawChannel} doesn't exist!`, message.channel, 4)
    }
}

exports.conf = {
    enabled: true,
    aliases: ['ma'],
    permLevel: "4"
};

exports.help = {
    name: "moveall",
    category: "Miscelaneous",
    description: "It like... Pings. Then Pongs. And it's not Ping Pong.",
    usage: "moveall"
};