const {
    MessageEmbed
} = require('discord.js');

const delay = (amount = number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, amount);
    });
}

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
    }, {
        name: 'Command',
        value: 'If you like using commands, you can also run \`!join <choice>\` where choice is the server number. e.g. \`!join 1\`'
    }] //, {
    //name: '\u200B',
    //value: '\u200B'
    //}]
    for (let i = 0; i < voiceServers.length; i++) {
        contentFields.push({
            name: `Server ${i+1}`,
            value: `**${voiceServers[i].name}** - react with ${reactEmojis[i+1]} or run \`!join ${i+1}\``
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
    oldMessages.forEach(async (message) => {
        if (message.deleted) return false;
        try {
            await message.delete();
        } catch (e) {
            client.logger.log('Error: ' + e.stack, "error")
        }
    })

}

const initMessage = async (channel, voiceServers) => {
    const message = await channel.send(generateMessageCard(voiceServers))
    for (let i = 0; i < voiceServers.length; i++) {
        try {
            await message.react(reactEmojis[i + 1])
        } catch (e) {
            client.logger.log('Error: ' + e.stack, "error")
        }
    }
    return message.id
}

const reload = async (client, moduleData, voiceRegistrations, guildId) => {
    await delay(1000);

    const setups = moduleData.get('setups')

    voiceRegistrations.delete(guildId)

    // Ensure voice registrations exist
    voiceRegistrations.ensure(guildId, {})

    setup = setups[guildId]
    textChannel = await client.channels.fetch(setup.textChannelId)

    // Get previous messageId
    const prevMessageId = await moduleData.getProp('setups', `${guildId}.messageId`)
    const prevMessage = await textChannel.messages.cache.get(prevMessageId)

    // Delete previous main message
    await prevMessage.delete()

    //await deleteMessagesFromChannel(textChannel)

    // Delete previous messageId
    await moduleData.deleteProp('setups', `${guildId}.messageId`)

    // Send message card and add reactions and get id back
    const messageId = await initMessage(textChannel, setup.voiceChannels)

    // Save messageId
    moduleData.setProp('setups', `${guildId}.messageId`, messageId)
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