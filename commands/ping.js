exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send("Ping?"); // client.sendDisappearingMessage("Ping?", message.channel, "5000") //  
    setTimeout(async () => {
        msg.delete()
    }, 5 * 1000)
    msg.edit(`<@${message.member.id}> Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`);
};

exports.conf = {
    enabled: true,
    aliases: ['p'],
    permLevel: "4"
};

exports.help = {
    name: "ping",
    category: "Miscelaneous",
    description: "It like... Pings. Then Pongs. And it's not Ping Pong.",
    usage: "ping"
};