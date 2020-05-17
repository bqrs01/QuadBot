const generateMessageCard = (voiceServers) => {
    return true;
}

const deleteMessagesFromChannel = async (channel) => {
    const oldMessages = await channel.messages.fetch()
    oldMessages.forEach((message) => {
        message.delete()
    })

}

module.exports = {
    generateMessageCard,
    deleteMessagesFromChannel
}