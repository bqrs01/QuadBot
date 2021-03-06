const Enmap = require('enmap');
const moduleData = new Enmap('quadbot.brightspace')
const request = require('request')
const {
    MessageAttachment
} = require('discord.js')

const {
    checkFeedsAndUpdate
} = require('./helpers')

function truncateString(str, num) {
    // If the length of str is less than or equal to num
    // just return str--don't truncate it.
    if (str.length <= num) {
        return str
    }
    // Return str truncated with '...' concatenated to the end of str.
    return str.slice(0, num) + '...'
}

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
            // const webhookId = arguments[1]
            // const webhookToken = arguments[2]
            // if (!channelId || !webhookId || !webhookToken) return replyMessage('the argument(s) were missing!', message, client)
            if (!channelId) return replyMessage('the channel id is missing!', message, client)

            let channel
            try {
                channel = await client.channels.fetch(channelId)
            } catch (e) {
                return replyMessage(`an error occured: ${e}`, message, client)
            }

            if (!moduleData.has('setups', guildId)) {
                moduleData.set('setups', {}, guildId)
            }

            if (!moduleData.has('setups', `${guildId}.${channelId}`)) {
                // moduleData.set('setups', {
                //     webhookId,
                //     webhookToken
                // }, `${guildId}.${channelId}`)

                // Use new system
                moduleData.set('setups', {
                    "migrated": true
                }, `${guildId}.${channelId}`)
            } else {
                // moduleData.set('setups', webhookId, `${guildId}.${channelId}.webhookId`)
                // moduleData.set('setups', webhookToken, `${guildId}.${channelId}.webhookToken`)
                return replyMessage('Nothing to update!', message, client)
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
    
        case 'divert':
            const diverted = moduleData.ensure('diverted', false)
            if (arguments[0] == "yes") {
                moduleData.set('diverted', true)
                return replyMessage('diverting messages!', message, client)
            } else if (arguments[0] == "no"){
                moduleData.set('diverted', false)
                return replyMessage('turning off divertion!', message, client)
            } else {
                return replyMessage('don\'t know what you want...', message, client)
            }
            break
        
        case 'allowmentions':
            const allowmentions = moduleData.ensure('allowmentions', true)
            if (arguments[0] == "yes") {
                moduleData.set('allowmentions', true)
                return replyMessage('allowing mentions!', message, client)
            } else if (arguments[0] == "no"){
                moduleData.set('allowmentions', false)
                return replyMessage('blocking mentions!', message, client)
            } else {
                return replyMessage('don\'t know what you want...', message, client)
            }
            break

        case 'debug':
            res1 = Buffer.from(JSON.stringify(moduleData.get('setups')))
            res2 = Buffer.from(JSON.stringify(moduleData.get('guids')))
            res3 = Buffer.from(JSON.stringify(moduleData.get('names')))

            file1 = new MessageAttachment(res1, 'setups.json')
            file2 = new MessageAttachment(res2, 'guids.json')
            file3 = new MessageAttachment(res3, 'names.json')

            return message.channel.send('Data: ', {
                files: [
                    file1,
                    file2,
                    file3
                ]
            })
            //return replyMessage(`${truncateString(JSON.stringify(moduleData.get('names')), 1985)}`, message, client, dis = false)
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
            await checkFeedsAndUpdate(moduleData, client)
            return replyMessage('reload successful.', message, client)
        case 'resetGuids':
            moduleData.set('guids', [], guildId)
            return replyMessage('reset successful.', message, client)
        case 'migrateNow':
            try {
                channelE = await client.channels.fetch(mChannelId)
            } catch (e) {
                return replyMessage(`an error occured: ${e}`, message, client)
            }

            if (!moduleData.has('setups', guildId)) {
                moduleData.set('setups', {}, guildId)
            }

            if (moduleData.has('setups', `${guildId}.${mChannelId}`)) {
                // moduleData.set('setups', {
                //     webhookId,
                //     webhookToken
                // }, `${guildId}.${channelId}`)
                if (!moduleData.has('setups', `${guildId}.${mChannelId}.migrated`)) {
                    // Migrate the setup
                    moduleData.set('setups', true, `${guildId}.${mChannelId}.migrated`)
                    return replyMessage('migrated successfully.', message, client)
                } else {
                    return replyMessage('channel already migrated!.', message, client)
                }

            } else {
                // moduleData.set('setups', webhookId, `${guildId}.${channelId}.webhookId`)
                // moduleData.set('setups', webhookToken, `${guildId}.${channelId}.webhookToken`)
                return replyMessage('no setup found to migrate!', message, client)
            }
            break
        case 'customSetup':
            file = message.attachments.first()
            if (file) {
                fileUrl = file.url
                request(fileUrl, async (err, response, body) => {
                    if (!err && response.statusCode == 200) {
                        try {
                            var newSetup = JSON.parse(body);
                            if (!moduleData.has('setups', guildId)) {
                                moduleData.set('setups', {}, guildId)
                            }
                            await moduleData.set('setups', newSetup, guildId)
                            return replyMessage('successfully added custom setup!', message, client)
                        } catch(e) {
                            return replyMessage(`error: ${e}`, message, client)
                        }
                    } else {
                        return replyMessage(`error: ${err}.`, message, client)
                    }
                })
            }
            break
        case 'tg':
            moduleData.set('guids', {})
            return replyMessage('tg done.', message, client)
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