const indexFunc = require('../')
const helpers = require('../helpers')

module.exports = async (client, _, _2, newState) => {
    if (!newState.channelID) return false;
    if (newState.member.user.bot) return newState.setChannel(null);
    const setups = indexFunc.moduleData.get('setups')
    // Loop through all guilds to check if voice channel is ours
    /*for (var k in setups) {
        console.log('debug', k)
    }*/
    for (var key in setups) {
        // Skip loop if the property is from prototype
        if (!setups.hasOwnProperty(key)) continue;
        if (!(setups[key].joinVoiceChannelId == newState.channelID)) continue;

        const userId = newState.id
        const textChannel = await client.channels.fetch(setups[key].textChannelId)

        // Check if they have selected a channel already.
        const index = indexFunc.voiceRegistrations.get(key, userId)

        if (typeof index !== 'string') {
            // They have not selected a channel
            newState.setChannel(null)
            return client.sendDisappearingMessage(`<@${newState.id}>, you first need to select a server before joining voice`,
                textChannel, 6)

        }
        const voiceChannels = setups[key].voiceChannels
        const voiceChannel = await client.channels.fetch(voiceChannels[parseInt(index, 10)].channelId)
        indexFunc.voiceRegistrations.delete(key, userId)
        newState.setChannel(voiceChannel)

    }
    /*
    // Get voice channel from member's newState
    if (newState.channelID && newState.channelID == "710245966342783099") {
        if (newState.member.user.bot) {
            const channel = await client.channels.fetch('710245938869829654')
            client.sendDisappearingMessage(`<@${newState.id}>, I don't move fellow bots!`, channel, 5)
            newState.setChannel(null)
        } else {
            const userId = newState.id
            if (client.voiceChannelRegistrations[userId]) {
                let choice = client.voiceChannelRegistrations[userId]
                if (choice == 1) {
                    // Move to project-discussion
                    const channel = await client.channels.cache.get("688052434463227980")
                    newState.setChannel(channel)
                    delete client.voiceChannelRegistrations[userId]
                } else {
                    // Move to catia-crew
                    const channel = await client.channels.cache.get("702784372654342184")
                    newState.setChannel(channel)
                    delete client.voiceChannelRegistrations[userId]
                }
            } else {
                newState.setChannel(null)
                const channel = await client.channels.fetch('710245938869829654')
                client.sendDisappearingMessage(`<@${newState.id}>, you first need to select a server before joining #join-voice!`,
                    channel, 6)
            }
        }
    }
    */
}