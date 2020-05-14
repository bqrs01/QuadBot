const {
    MessageEmbed
} = require('discord.js')

module.exports = async client => {
    const mainMessageEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('How to join voice?')
        .setAuthor('QuadBot')
        .addFields({
            name: 'Instructions',
            value: 'First select the voice channel by reacting with the options below (1 or 2). Once you\'ve reacted, join the voice channel.'
        }, {
            name: '\u200B',
            value: '\u200B'
        }, {
            name: 'Main Project Discussion',
            value: 'React with 1.',
            inline: true
        }, {
            name: 'CATIA Crew',
            value: 'React with 2.',
            inline: true
        }, )
        .setTimestamp()


    client.logger.log('Connected as ' + client.user.tag, 'ready')

    client.user.setActivity('AE1222-I', {
        type: 'WATCHING'
    })

    // AE Group 10E server ref
    const server = await client.guilds.cache.get("688031444664188943")

    // Get channel refs
    const selectVoiceChannel = client.channels.cache.get("710245938869829654")
    const joinVoiceChannel = client.channels.cache.get("710245966342783099")

    // Delete previous message, if any
    const oldMessages = await selectVoiceChannel.messages.fetch()
    oldMessages.forEach((message) => {
        message.delete()
    })

    const mainMessage = await selectVoiceChannel.send(mainMessageEmbed)
    mainMessage.react('1️⃣')
    mainMessage.react('2️⃣')
    client.mainMessageId = mainMessage.id
};