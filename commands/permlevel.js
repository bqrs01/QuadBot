exports.run = async (client, message, args, level) => {
    client.sendDisappearingMessage(`<@${message.member.id}>, you have permlevel ${level}!`, message.channel, 5)
}

exports.conf = {
    enabled: true,
    aliases: ['pl'],
    permLevel: "3"
};

exports.help = {
    name: "permlevel",
    category: "Miscelaneous",
    description: "",
    usage: "permlevel"
};