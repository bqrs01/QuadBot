const Enmap = require('enmap')
const moduleData = new Enmap('quadbot.baserole')

const replyMessage = (text, message, client, dis = true) => {
    if (!dis) return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 60)
    else {
        return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 5)
    }
}

exports.run = async(client, message, args, level) => {
    const command = args[0]
    const arguments = args.slice(1)
    const guildId = message.guild.id;

    switch (command) {
        // enable [roleId] (override: Boolean)
        case 'enable':

            roleId = arguments[0]
            override = arguments[1] == "true" ? true : false;

            if (!roleId) return replyMessage('role is missing!', message, client)

            if (!moduleData.has('setups', guildId)) {
                moduleData.set('setups', {}, guildId)
            }

            if (!moduleData.has('setups', `${guildId}.enabled`)) {
                moduleData.set('setups', {
                    "enabled": true,
                    "roleId": roleId
                }, `${guildId}`)
            } else {
                if (override) {
                    moduleData.set('setups', {
                        "roleId": roleId
                    }, `${guildId}`)

                    return replyMessage('role id updated successfully.', message, client)
                } else {
                    return replyMessage('role already setup.', message, client)
                }
            }

            return replyMessage('role setup successful and active.', message, client)

            break;
        case 'disable':
            if (!moduleData.has('setups', guildId)) {
                return replyMessage('server not setup before.', message, client)
            }

            moduleData.set('setups', {
                "enabled": false
            }, `${guildId}`)

            break;
    }
}

exports.init = (client) => {
    // Check if Collection for setups exist
    if (!moduleData.has('setups')) moduleData.set('setups', {})
    return null;
}

exports.props = {
    name: 'baserole',
    enabled: true
}

exports.moduleData = moduleData