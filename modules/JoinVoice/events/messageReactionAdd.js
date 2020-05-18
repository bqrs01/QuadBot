const indexFunc = require('../')
const helpers = require('../helpers')

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

module.exports = async (client, _, messageReaction, user) => {
    if (user.id == "710239236669964380") return false;
    const setups = indexFunc.moduleData.get('setups')
    // Loop through all guilds to check if reacted message is ours
    for (var key in setups) {
        // Skip loop if the property is from prototype
        if (!setups.hasOwnProperty(key)) continue;
        if (!(setups[key].messageId == messageReaction.message.id)) continue;
        // Handle message reaction
        // Get ID of channel from emoji
        const emojiUsed = messageReaction.emoji.name
        const index = getKeyByValue(helpers.reactEmojis, emojiUsed)

        indexFunc.voiceRegistrations.set(key, `${(index - 1)}`, user.id)
        const guild = await client.guilds.cache.get(key)
        const member = await guild.members.fetch(user.id)

        const voiceState = member.voice;

        messageReaction.users.remove(user.id)

        if (voiceState.channelID && voiceState.channelID == setups[key].joinVoiceChannelId) {
            const voiceChannel = await client.channels.fetch(setups[key].joinVoiceChannelId)
            voiceState.setChannel(voiceChannel)
            return client.sendDisappearingMessage(`${user}, successfully joined you to ${setups[key].voiceChannels[index-1].name}!`, messageReaction.message.channel, 6)
        } else {
            return client.sendDisappearingMessage(`${user}, your selection was received. Please join voice now!`, messageReaction.message.channel, 6)
        }
    }

    /*
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
    }*/
}