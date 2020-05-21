const {
    moduleData
} = require('../index')

const {
    updateMemberCount
} = require('../helpers')

module.exports = async (client, _, member) => {
    if (moduleData.hasProp('setups', member.guild.id)) {
        const channelId = moduleData.getProp('setups', `${member.guild.id}.channelId`)
        let channel, guild
        try {
            channel = await client.channels.fetch(channelId)
            guild = await client.guilds.cache.get(member.guild.id)
        } catch (e) {
            return console.log(`an error occured: ${e}`)
        }

        await updateMemberCount(channel, guild)
    }
}