const Enmap = require('enmap');
const moduleData = new Enmap('quadbot.joinvoice')
const Collection = require('discord.js').Collection

const {
    deleteMessagesFromChannel,
    generateMessageCard
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

exports.run = async (client, message, args, level) => {
    command = args[0]

    switch (command) {
        case "addSetup":
            const textChannelId = args[1]
            const joinVoiceChannelId = args[2]
            if (!(textChannelId && joinVoiceChannelId)) return client.sendDisappearingMessage(`${message.member}, the arguments were missing!`, message.channel, 4)
            let textChannel, joinVoiceChannel
            try {
                textChannel = await client.channels.fetch(textChannelId)
                joinVoiceChannel = await client.channels.fetch(joinVoiceChannelId)
            } catch (e) {
                return client.sendDisappearingMessage(`${message.member}, an error occured: ${e}`, message.channel, 4)
            }

            // Check if guild of both channels is same
            if (textChannel.guild.id !== joinVoiceChannel.guild.id) return client.sendDisappearingMessage(`${message.member}, the channels are on different servers!`, message.channel, 4)
            // !r joinvoice addSetup 710245938869829654 710245966342783099

            const guildId = textChannel.guild.id;
            console.log(typeof guildId)

            moduleData.set('setups', guildId, {
                textChannelId,
                joinVoiceChannelId,
                voiceChannels: []
            })
            // deleteMessagesFromChannel(textChannel)



            break
        case "try":
            client.sendDisappearingMessage(`${message.member}, ${moduleData.get('')}`, message.channel, 4)
            break
    }
}

exports.init = (client) => {
    // Check if Collection for setups exist
    if (!moduleData.has('setups')) moduleData.set('setups', new Collection())

    return null;
}

exports.props = {
    name: 'joinvoice',
    enabled: false
}

exports.moduleData = moduleData