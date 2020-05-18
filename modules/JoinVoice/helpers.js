const {
    MessageEmbed
} = require('discord.js');

const reactEmojis = {
    1: '1️⃣',
    2: '2️⃣',
    3: '3️⃣',
    4: '4️⃣',
    5: '5️⃣',
    6: '6️⃣',
    7: '7️⃣',
    8: '8️⃣',
    9: '9️⃣'
}

const generateMessageCard = (voiceServers) => {
    let contentFields = [{
        name: 'Instructions',
        value: 'First select the voice channel by reacting with the options below. Once you\'ve reacted, join the voice channel.'
    }] //, {
    //name: '\u200B',
    //value: '\u200B'
    //}]
    for (let i = 0; i < voiceServers.length; i++) {
        contentFields.push({
            name: voiceServers[i].name,
            value: `React with ${reactEmojis[i+1]}`
        })
    }

    const mainMessageEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('How to join voice?')
        .setAuthor('QuadBot')
        .addFields(contentFields)

    return mainMessageEmbed;
}

const deleteMessagesFromChannel = async (channel) => {
    const oldMessages = await channel.messages.fetch()
    oldMessages.forEach((message) => {
        message.delete()
    })

}

const initMessage = async (channel, voiceServers) => {
    const message = await channel.send(generateMessageCard(voiceServers))
    for (let i = 0; i < voiceServers.length; i++) {
        await message.react(reactEmojis[i + 1])
    }
    return message.id
}

const reload = async (client, moduleData) => {

}

/*
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
*/

module.exports = {
    generateMessageCard,
    deleteMessagesFromChannel,
    reload,
    initMessage,
    reactEmojis
}