module.exports = async (client, messageReaction, user) => {
    if (messageReaction.message.id == client.mainMessageId && user.id != "710239236669964380") {
        client.logger.log("We got a reaction from " + user.tag)
        if (messageReaction.emoji.name == '1️⃣') {
            // project-discussion voice channel
            client.voiceChannelRegistrations[user.id] = 1
            // selectVoiceChannel.send(`@${user.tag} Please join the 'join-voice' channel now!`)
            client.sendDisappearingMessage(`<@${user.id}>, you have selected to join project-discussion. Please join **<#710245966342783099>**!`, messageReaction.message.channel, 6.5)
        } else if (messageReaction.emoji.name == '2️⃣') {
            // catia-crew voice channel
            client.voiceChannelRegistrations[user.id] = 2
            client.sendDisappearingMessage(`<@${user.id}>, you have selected to join catia-crew. Please join **<#710245966342783099>**!`, messageReaction.message.channel, 6.5)
        }
        messageReaction.users.remove(user.id)
    }
}