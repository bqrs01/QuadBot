const Enmap = require('enmap');
const moduleData = new Enmap('quadbot.brightspace')

// const {
//     updateMemberCount
// } = require('./helpers')

const replyMessage = (text, message, client, dis = true) => {
    if (!dis) return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 60)
    else {
        return client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 5)
    }
}

exports.run = async (client, message, args, level) => {
    const command = args[0]
    const arguments = args.slice(1)
    const guildId = message.guild.id;
    const mChannelId = message.channel.id;

    switch (command) {
        case 'addSetup':
            const channelId = arguments[0]
            const webhookId = arguments[1]
            const webhookToken = arguments[2]
            if (!channelId || !webhookId || !webhookToken) return replyMessage('the argument(s) were missing!', message, client)

            let channel
            try {
                channel = await client.channels.fetch(channelId)
            } catch (e) {
                return replyMessage(`an error occured: ${e}`, message)
            }

            if (!moduleData.has('setups', guildId)) {
                moduleData.set('setups', {}, guildId)
            }

            if (!moduleData.has('setups', `${guildId}.${channelId}`)) {
                moduleData.set('setups', {
                    webhookId,
                    webhookToken
                }, `${guildId}.${channelId}`)
            } else {
                moduleData.set('setups', webhookId, `${guildId}.${channelId}.webhookId`)
                moduleData.set('setups', webhookToken, `${guildId}.${channelId}.webhookToken`)
                return replyMessage('Updated webhook. Call \`reload\` to activate.', message, client)
            }

            replyMessage('setup successful. Call \`reload\` to activate.', message, client)
            break
        case 'removeSetup':
            if (!moduleData.hasProp('setups', guildId)) return replyMessage('this server is not setup!', message, client)
            if (!moduleData.hasProp('setups', `${guildId}.${mChannelId}`)) return replyMessage('this server is not setup!', message, client)

            await moduleData.deleteProp('setups', `${guildId}.${mChannelId}`)

            replyMessage('setup successfully removed. Please delete the webhook now.', message, client)
            break
        case 'addFeed':
            // ... addFeed feedUrl courseChannel studentRole name
            feedUrl = arguments[0]
            courseChannelId = arguments[1]
            studentRoleId = arguments[2]
            courseName = arguments.slice(3).join(" ")
            
            if (!feedUrl || !courseChannelId || !studentRoleId || !courseName) return replyMessage('the argument(s) were missing!', message, client)
            if (!moduleData.has('setups', `${guildId}.${mChannelId}`)) return replyMessage('this channel is not setup!', message, client)
            setupBefore = (moduleData.ensure('setups', [], `${guildId}.${mChannelId}.feeds`).filter((a) => a.feedUrl == feedUrl)).length > 0
            if (setupBefore) {
                return replyMessage('this feed has already been setup!', message, client)
            }

            let feeds = moduleData.get('setups', `${guildId}.${mChannelId}.feeds`)
            feeds.push({
                feedUrl,
                courseChannelId,
                studentRoleId,
                courseName
            })
            moduleData.set('setups', feeds, `${guildId}.${mChannelId}.feeds`)

            replyMessage('feed successfully added.', message, client)
            break
        case 'removeFeed':
            feedUrl = arguments[0]
            if (!feedUrl) return replyMessage('the argument(s) were missing!', message, client)
            if (!moduleData.has('setups', `${guildId}.${mChannelId}`)) return replyMessage('this channel is not setup!', message, client)
            setupBefore = (moduleData.ensure('setups', [], `${guildId}.${mChannelId}.feeds`).filter((a) => a.feedUrl == feedUrl)).length > 0

            if (!setupBefore) {
                return replyMessage('this feed does not exist!', message, client)
            }

            let feedsA = moduleData.get('setups', `${guildId}.${mChannelId}.feeds`)
            const deletedFeed = feedsA.find((a) => a.feedUrl == feedUrl)
            const index = feedsA.indexOf(deletedFeed)
            feedsA.splice(index, 1)

            moduleData.set('setups', feedsA, `${guildId}.${mChannelId}.feeds`)

            replyMessage('feed successfully removed.', message, client)
            break
        case 'addName':
            names = moduleData.ensure('names', [])
            nameToAdd = arguments[0].toLowerCase()
            if (names.indexOf(nameToAdd) != -1) {
                return replyMessage('this name already exists!', message, client)
            }

            names.push(nameToAdd)

            moduleData.set('names', names)

            replyMessage('name successfully added.', message, client)
            
            break

        case 'debug':
            replyMessage(`${JSON.stringify(moduleData.get('setups'))}`, message, client, dis = false)
            replyMessage(`${JSON.stringify(moduleData.get('guids'))}`, message, client, dis = false)
            return replyMessage(`${JSON.stringify(moduleData.get('names'))}`, message, client, dis = false)
        case 'reload':
            // const guildIdA = message.guild.id;
            // if (!moduleData.hasProp('setups', guildIdA)) return replyMessage('this server is not setup!', message, client)
            // const channelIdA = moduleData.get('setups', `${guildIdA}.channelId`)
            // let guild, channelA
            // try {
            //     guild = await client.guilds.cache.get(guildIdA)
            //     channelA = await client.channels.fetch(channelIdA)
            // } catch (e) {
            //     return replyMessage(`an error occured: ${e}`, message, client)
            // }

            // await updateMemberCount(channelA, guild)

            return replyMessage('reload successful.', message, client)
        case 'resetGuids':
            moduleData.set('guids', [])
            return replyMessage('reset successful.', message, client)
    }
}

exports.init = (client) => {
    // Check if Collection for setups exist
    if (!moduleData.has('setups')) moduleData.set('setups', {})
    return null;
}

exports.props = {
    name: 'bs',
    enabled: true
}

exports.moduleData = moduleData
exports.mainInterval = null