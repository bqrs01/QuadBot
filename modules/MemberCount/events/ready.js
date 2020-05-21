const {
    moduleData
} = require('../index')

const {
    updateMemberCount
} = require('../helpers')

module.exports = async (client, _) => {
    const setups = moduleData.get('setups')
    for (let setup in setups) {
        if (!setups.hasOwnProperty(setup)) return;

        const channelId = await moduleData.getProp('setups', `${setup}.channelId`)
        let channel, guild
        try {
            channel = await client.channels.fetch(channelId)
            guild = await client.guilds.cache.get(setup)
        } catch (e) {
            return console.log(`an error occured: ${e}`)
        }

        await updateMemberCount(channel, guild)
    }
}