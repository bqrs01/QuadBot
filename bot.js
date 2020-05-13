const Discord = require('discord.js');
const client = new Discord.Client();
const secrets = require('./secrets.json');

/*
AE Group 10E
 - project-discussion text 688050153919479828
 - welcome text 688050192200761359
 - project-discussion voice 688052434463227980
 - General category 688054137371361376
 - Project category 688054578973114403
 - system-messages text 688073167377662019
 - Admin category 688073215989383181
 - afk voice 688073398022307840
 - Testing category 688326407755005999
 - testing text 688326443884609594
 - commands text 690092114117525548
 - private-mega voice 690116593505665033
 - catia-crew voice 702784372654342184
 - Special category 710245837929971772
 - select-voice text 710245938869829654
 - join-voice voice 710245966342783099

 // member role => 688033141910143085
*/

let mainMessageId = ""

let voiceChannelRegistrations = {}

const mainMessageEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Join voice channel')
	.setAuthor('QuadBot')
	.addFields(
		{ name: 'Instructions', value: 'Join the voice channel by reacting with the options below. Once you\'ve reacted, join the \'join-voice\' channel.'},
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Main Project Discussion', value: 'React with 1.', inline: true },
		{ name: 'CATIA Crew', value: 'React with 2.', inline: true },
	)
	.setTimestamp()


client.on('ready', async () => {
    console.log('Connected as ' + client.user.tag)

    client.user.setActivity('AE1222-I', {type: 'WATCHING'})

    /*client.guilds.cache.forEach((guild) => {
        console.log(guild.name + guild.id)
        guild.channels.cache.forEach((channel) => {
            console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
        })
    })*/

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
    mainMessageId = mainMessage.id
})

client.on('messageReactionAdd', async (messageReaction, user) => {
    //console.log(messageReaction.me)
    if (messageReaction.message.id == mainMessageId && user.id != "710239236669964380") {
        console.log("We got a reaction from " + user.tag)
        if (messageReaction.emoji.name == '1️⃣') {
            // project-discussion voice channel
            voiceChannelRegistrations[user.id] = 1
            // selectVoiceChannel.send(`@${user.tag} Please join the 'join-voice' channel now!`)
        } else if (messageReaction.emoji.name == '2️⃣') {
            // catia-crew voice channel
            voiceChannelRegistrations[user.id] = 2
        }
        messageReaction.users.remove(user.id)
    }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
    //console.log(newState)
    // Get voice channel from member's newState
    if (newState.channelID && newState.channelID == "710245966342783099") {
       const userId = newState.id
       console.log(voiceChannelRegistrations)
       if (voiceChannelRegistrations[userId]) {
           let choice = voiceChannelRegistrations[userId]
           if (choice == 1) {
               // Move to project-discussion
               const channel = await client.channels.cache.get("688052434463227980")
               newState.setChannel(channel)
               delete voiceChannelRegistrations[userId]
           } else {
               // Move to catia-crew
               const channel = await client.channels.cache.get("702784372654342184")
               newState.setChannel(channel)
               delete voiceChannelRegistrations[userId]
           }
       } else {
           newState.setChannel(null)
       }
    }
})

client.login(secrets.discordToken)