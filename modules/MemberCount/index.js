const Enmap = require('enmap');
const moduleData = new Enmap('quadbot.membercount')

const {
    updateMemberCount
} = require('./helpers')

const replyMessage = (text, message, client, dis = true) => {
    if (!dis) return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 60)
    else {
        return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 5)
    }
}

exports.run = async (client, message, args, level) => {
    const command = args[0]
    const arguments = args.slice(1)

    switch (command) {
        case 'addSetup':
            const channelId = arguments[0]
            if (!channelId) return replyMessage('the argument were missing!', message, client)

            let channel
            try {
                channel = await client.channels.fetch(channelId)
            } catch (e) {
                return replyMessage(`an error occured: ${e}`, message)
            }

            const guildId = channel.guild.id;

            moduleData.set('setups', {
                channelId
            }, guildId)

            replyMessage('setup successful. Call \`reload\` to activate.', message, client)
            break
        case 'removeSetup':
            const guildIdB = message.guild.id;
            if (!moduleData.hasProp('setups', guildIdB)) return replyMessage('this server is not setup!', message, client)

            await moduleData.deleteProp('setups', guildIdB)

            replyMessage('server successfully removed. Please delete the channel now.', message, client)
            break
        case 'reload':
            const guildIdA = message.guild.id;
            if (!moduleData.hasProp('setups', guildIdA)) return replyMessage('this server is not setup!', message, client)
            const channelIdA = moduleData.get('setups', `${guildIdA}.channelId`)
            let guild, channelA
            try {
                guild = await client.guilds.cache.get(guildIdA)
                channelA = await client.channels.fetch(channelIdA)
            } catch (e) {
                return replyMessage(`an error occured: ${e}`, message, client)
            }

            await updateMemberCount(channelA, guild)

            return replyMessage('reload successful.', message, client)
        case 'reloadOther':
            const guildIdC = arguments[0];
            if (!guildIdC) {
                return replyMessage("Sorry, no guild ID mentioned!")
            }

            if (!moduleData.hasProp('setups', guildIdC)) return replyMessage('this other server is not setup!', message, client)
            const channelIdC = moduleData.get('setups', `${guildIdC}.channelId`)
            let guildB, channelC
            try {
                guildB = await client.guilds.cache.get(guildIdC)
                channelC = await client.channels.fetch(channelIdC)
            } catch (e) {
                return replyMessage(`an error occured: ${e}`, message, client)
            }

            await updateMemberCount(channelC, guildB)

            return replyMessage('reload successful.', message, client)
    }
}

exports.init = (client) => {
    // Check if Collection for setups exist
    if (!moduleData.has('setups')) moduleData.set('setups', {})
    return null;
}

exports.props = {
    name: 'membercount',
    enabled: true
}

exports.moduleData = moduleData