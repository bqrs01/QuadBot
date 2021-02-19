let {
    moduleData
} = require('../index')

module.exports = async(client, oldMember, newMember) => {
    console.log(oldMember, newMember)
    // Check if pending has changed
    if (oldMember.pending && !newMember.pending) {
        // Get guildId to check if guild is setup
        guildId = oldMember.guild.id
        if (moduleData.has('setups', guildId) && moduleData.get('setups', `${guildId}.enabled`)) {
            // Guild is setup. Give base role to member.
            roleId = moduleData.get('setups', `${guildId}.roleId`)
            newMember.guild.roles.fetch(roleId).then(role => {
                if (role) {
                    newMember.roles.add(role)
                }
            });
        }
    }

}