const {
    moduleData,
} = require('../')
const {
    initMessage,
    deleteMessagesFromChannel
} = require('../helpers')
module.exports = async (client, _) => {
    const setups = moduleData.get('setups')

    for (var key in setups) {
        // skip loop if the property is from prototype
        if (!setups.hasOwnProperty(key)) continue;

        setup = setups[key]
        textChannel = await client.channels.fetch(setup.textChannelId)

        // Delete previous messageId
        moduleData.deleteProp('setups', `${key}.messageId`)

        // Delete all previous messages
        deleteMessagesFromChannel(textChannel)

        // Send message card and add reactions and get id back
        const messageId = await initMessage(textChannel, setup.voiceChannels)

        // Save messageId
        moduleData.setProp('setups', `${key}.messageId`, messageId)
    }
}