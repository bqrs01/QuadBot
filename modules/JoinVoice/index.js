const Enmap = require('enmap');
const moduleData = new Enmap('quadbot.joinvoice')
const voiceRegistrations = new Enmap()

const {
    deleteMessagesFromChannel,
    generateMessageCard,
    reload
} = require('./helpers');

const delay = (amount = number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, amount);
    });
}

// !r joinvoice addVoice Main Project Discussion, 688052434463227980
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
        case "addSetup":
            const textChannelId = arguments[0]
            const joinVoiceChannelId = arguments[1]
            if (!(textChannelId && joinVoiceChannelId)) return replyMessage('the arguments were missing!', message, client)
            let textChannel, joinVoiceChannel
            try {
                textChannel = await client.channels.fetch(textChannelId)
                joinVoiceChannel = await client.channels.fetch(joinVoiceChannelId)
            } catch (e) {
                return replyMessage(`an error occured: ${e}`, message, client)
            }

            // Check if guild of both channels is same
            if (textChannel.guild.id !== joinVoiceChannel.guild.id) return replyMessage('the channels are on different servers!', message, client)
            // !r joinvoice addSetup 710245938869829654 710245966342783099

            const guildId = textChannel.guild.id;

            moduleData.set('setups', {
                textChannelId,
                joinVoiceChannelId,
                voiceChannels: []
            }, guildId);

            replyMessage('setup successful. Add voice channels to route to now!', message, client)

            return reload(client, moduleData, voiceRegistrations, guildId)
        case "addVoice":
            // Get text channel from message
            let channel = message.channel
            const guildIdA = channel.guild.id
            existingSetup = moduleData.get('setups', guildIdA) //.findKey(a => a.textChannelId == channel.id)
            if (!existingSetup) return replyMessage('please run addSetup first before running addVoice!', message, client)

            // Get raw args from message
            // rawArguments = arguments.join(" ")
            //rawArguments = rawArguments.split(", ")
            //voiceName = rawArguments[0]
            voiceId = arguments[0]
            voiceName = arguments.splice(1).join(" ")

            try {
                voiceChannel = await client.channels.fetch(voiceId)
            } catch (e) {
                return replyMessage(`an error occured: ${e}`, message, client)
            }

            if (!(voiceName && voiceId && voiceChannel)) return replyMessage('please try again (bad formatting)!', message, client)
            if (moduleData.get('setups', `${guildIdA}.joinVoiceChannelId`) == voiceId) return replyMessage('you cannot use the join voice channel here!', message, client)
            if (moduleData.get('setups', `${guildIdA}.voiceChannels`).find(b => b.channelId == voiceId)) return replyMessage('this voice channel is already in the list!', message, client)

            // Save information
            moduleData.push('setups', {
                name: voiceName,
                channelId: voiceId
            }, `${guildIdA}.voiceChannels`)

            replyMessage('successfully added voice channel!', message, client)

            delay(3000)

            return reload(client, moduleData, voiceRegistrations, guildIdA)
            break
        case "removeVoice":
            let channelA = message.channel
            const guildIdE = channelA.guild.id
            existingSetup = moduleData.get('setups', guildIdE) //.findKey(a => a.textChannelId == channel.id)
            if (!existingSetup) return replyMessage('please run addSetup first before running removeVoice!', message, client)

            let voiceChannels = moduleData.get('setups', `${guildIdE}.voiceChannels`)
            let exists1 = voiceChannels.findIndex(a => a.channelId == arguments[0])
            let exists2 = voiceChannels.findIndex(a => a.name == arguments.join(" "))
            let index;
            if (exists1 == -1) {
                if (exists2 == -1) {
                    return replyMessage('voice channel not setup previously!', message, client)
                } else {
                    index = exists2
                }
            } else {
                index = exists1
            }
            const exists = voiceChannels[index]
            voiceChannels.splice((index))
            moduleData.set('setups', voiceChannels, `${guildIdE}.voiceChannels`)
            replyMessage(`voice channel \`${exists.name}\` removed successfully!`, message, client)
            return reload(client, moduleData, voiceRegistrations, guildIdE)

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
        case "reload":
            const guildIdD = message.channel.guild.id
            reload(client, moduleData, voiceRegistrations, guildIdD)
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