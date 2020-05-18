const Enmap = require('enmap');
const moduleData = new Enmap('quadbot.joinvoice')
const voiceRegistrations = new Enmap()

const {
    deleteMessagesFromChannel,
    generateMessageCard,
    reload
} = require('./helpers');

/*
setups: [{
    textChannelId: ...,
    joinVoiceChannelId: ...,
    voiceChannels: [{
        name: ...,
        channelId: ...
    }]
}]
*/

const replyMessage = (text, message, client) => {
    client.sendDisappearingMessage(`${message.member}, ${text}`, message.channel, 5)
}

exports.run = async (client, message, args, level) => {
    const command = args[0]
    const arguments = args.slice(1)

    switch (command) {
        case "addSetup":
            const textChannelId = arguments[0]
            const joinVoiceChannelId = arguments[1]
            if (!(textChannelId && joinVoiceChannelId)) return replyMessage('the arguments were missing!', message, client)
            let textChannel, joinVoiceChannel
            try {
                textChannel = await client.channels.fetch(textChannelId)
                joinVoiceChannel = await client.channels.fetch(joinVoiceChannelId)
            } catch (e) {
                return replyMessage(`an error occured: ${e}`, message)
            }

            // Check if guild of both channels is same
            if (textChannel.guild.id !== joinVoiceChannel.guild.id) return replyMessage('the channels are on different servers!', message, client)
            // !r joinvoice addSetup 710245938869829654 710245966342783099

            const guildId = textChannel.guild.id;
            console.log(typeof guildId)

            moduleData.set('setups', {
                textChannelId,
                joinVoiceChannelId,
                voiceChannels: []
            }, guildId);

            return replyMessage('setup successful. Add voice channels to route to now!', message, client)
        case "addVoice":
            // Get text channel from message
            let channel = message.channel
            const guildIdA = channel.guild.id
            existingSetup = moduleData.get('setups', guildIdA) //.findKey(a => a.textChannelId == channel.id)
            if (!existingSetup) return replyMessage('please run addSetup first before running addVoice!', message, client)

            // Get raw args from message
            rawArguments = arguments.join(" ")
            rawArguments = rawArguments.split(", ")
            voiceName = rawArguments[0]
            voiceId = rawArguments[1]

            if (!(voiceName && voiceId)) return replyMessage('please try again (bad formatting)!', message, client)
            if (moduleData.get('setups', `${guildIdA}.joinVoiceChannelId`) == voiceId) return replyMessage('you cannot use the join voice channel here!', message, client)
            if (moduleData.get('setups', `${guildIdA}.voiceChannels`).find(b => b.channelId == voiceId)) return replyMessage('this voice channel is already in the list!', message, client)

            // Save information
            moduleData.push('setups', {
                name: voiceName,
                channelId: voiceId
            }, `${guildIdA}.voiceChannels`)

            return replyMessage('successfully added voice channel!', message, client)
            break
        case "debug":
            client.sendDisappearingMessage(`${message.member}, ${JSON.stringify(moduleData.get('setups'))}`, message.channel, 20)
            client.sendDisappearingMessage(`${message.member}, ${JSON.stringify(voiceRegistrations.export())}`, message.channel, 20)
            break
        case "test":
            const guildIdB = message.channel.guild.id
            existingSetup = moduleData.get('setups', guildIdB)
            if (!existingSetup) return replyMessage('no setup found to test!', message, client)
            message.channel.send(generateMessageCard(existingSetup.voiceChannels))
            break;
        case "reset":
            // Get guild id
            const guildIdC = message.channel.guild.id
            moduleData.delete('setups', guildIdC)
            voiceRegistrations.delete(guildIdC)
            return replyMessage('successfully reset JoinVoice for current server!', message, client)
    }
}

exports.init = (client) => {
    // Check if Collection for setups exist
    if (!moduleData.has('setups')) moduleData.set('setups', {})

    return null;
}

exports.props = {
    name: 'joinvoice',
    enabled: true
}

exports.moduleData = moduleData
exports.voiceRegistrations = voiceRegistrations