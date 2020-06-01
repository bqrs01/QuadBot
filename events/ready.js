const {
    MessageEmbed
} = require('discord.js')

module.exports = async client => {
    const mainMessageEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('How to join voice?')
        .setAuthor('QuadBot')
        .addFields([{
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
        }])
        .setTimestamp()


    client.logger.log('Connected as ' + client.user.tag, 'ready')

    client.user.setActivity('Black Mirror', {
        type: 'WATCHING'
    })
};