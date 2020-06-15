const request = require('request')

const replyMessage = (text, message, client, dis = true) => {
    if (!dis) return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 60)
    else {
        return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 5)
    }
}

exports.run = async (client, message, args, level) => {
    file = message.attachments.first()
    if (file) {
        messageId = args[0]
        channelId = args[1] || message.channel.id
        console.log(messageId, channelId)
        if (messageId && channelId) {
            try {
                const channel = await client.channels.fetch(channelId)
                const messageTBE = await channel.messages.fetch(messageId, true)
                if (!messageTBE) {
                    return replyMessage(`message not found!`, message, client)
                }
                fileUrl = file.url
                request(fileUrl, async (err, response, body) => {
                    if (!err && response.statusCode == 200) {
                        try {
                            messageTBE.edit(body)
                            return replyMessage('successfully edited message!', message, client)
                        } catch (e) {
                            return replyMessage(`error: ${e}`, message, client)
                        }
                    } else {
                        return replyMessage(`error: ${err}.`, message, client)
                    }
                })
            } catch (e) {
                return replyMessage(`error: ${e}`, message, client)
            }
        }
    }
}

exports.conf = {
    enabled: true,
    aliases: ['em'],
    permLevel: "5"
};

exports.help = {
    name: "edit_message",
    category: "Chat",
    description: "",
    usage: "edit_message"
};