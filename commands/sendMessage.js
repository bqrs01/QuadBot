const request = require('request')

const replyMessage = (text, message, client, dis = true) => {
    if (!dis) return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 60)
    else {
        return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 5)
    }
}

exports.run = async (client, message, args, level) => {
    file = message.attachments.first()
    channelId = args[0] || message.channel.id
    pin = args[1] || 'no'
    if (file) {
        fileUrl = file.url
        request(fileUrl, async (err, response, body) => {
            if (!err && response.statusCode == 200) {
                try {
                    let channel = await client.channels.fetch(channelId)
                    let pinnedMessage = await channel.send(body)
                    if (pin == 'yes') {
                        await pinnedMessage.pin()
                    }
                    return replyMessage('successfully sent message!', message, client)
                } catch (e) {
                    return replyMessage(`error: ${e}`, message, client)
                }
            } else {
                return replyMessage(`error: ${err}.`, message, client)
            }
        })
    }
}

exports.conf = {
    enabled: true,
    aliases: ['sm'],
    permLevel: "5"
};

exports.help = {
    name: "send_message",
    category: "Chat",
    description: "",
    usage: "send_message"
};