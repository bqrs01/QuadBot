module.exports.updateMemberCount = async (channel, guild) => {
    await guild.members.fetch() // Key line to ensure correct member count
    const members = await guild.members.cache.filter(a => (!a.user.bot))
    const memberCount = members.size
    try {
        await channel.setName(`Members: ${memberCount}`)
    } catch (e) {
        console.log(`an error occured: ${e}`)
    }
}