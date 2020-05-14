module.exports = async (client, _, newState) => {
    //console.log(newState)
    // Get voice channel from member's newState
    if (newState.channelID && newState.channelID == "710245966342783099") {
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