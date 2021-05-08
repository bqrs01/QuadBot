const Parser = require('rss-parser');
let parser = new Parser();
const {
    WebhookClient,
    Webhook
} = require("discord.js")
const crypto = require('crypto')
// const {
//     moduleData
// } = require('./index')

function truncateString(str, num) {
    // If the length of str is less than or equal to num
    // just return str--don't truncate it.
    if (str.length <= num) {
        return str
    }
    // Return str truncated with '...' concatenated to the end of str.
    return str.slice(0, num) + '...'
}


module.exports.checkFeedsAndUpdate = async (moduleData, client) => {
    const guids = moduleData.ensure('guids', {})
    const names = moduleData.ensure('names', [])
    const diverted = moduleData.ensure('diverted', true)
    const allowmentions = moduleData.ensure('allowmentions', false)
    const setups = moduleData.get('setups')
    for (let setup in setups) {
        if (!setups.hasOwnProperty(setup)) return;
        setupData = setups[setup]
        guildId = setup
        for (let bc in setupData) {
            if (!setupData.hasOwnProperty(bc)) return;
            channelData = setupData[bc]
            channelId = bc
            webhookId = channelData.webhookId || ""
            webhookToken = channelData.webhookToken || ""
            migrated = channelData.migrated || false
            //console.log(channelData)
            for (let feed in channelData.feeds) {
                feedData = channelData.feeds[feed]
                feedUrl = feedData.feedUrl
                courseName = feedData.courseName
                //console.log(feedData)a
                let fetchedFeed = await parser.parseURL(feedUrl);
                for (let item in fetchedFeed.items) {
                    itemData = fetchedFeed.items[item]
                    itemId = itemData.guid || itemData.id
                    if (!guids[guildId]) {
                        guids[guildId] = []
                    }
                    if (!guids[guildId].includes(itemId)) {
                        desc = `**${itemData.title}**\n${itemData.contentSnippet}`
                        for (var i = 0; i < names.length; i++) {
                            var searchMask = names[i];
                            var regEx = new RegExp(searchMask, "ig");
                            var replaceMask = "student";

                            desc = desc.replace(regEx, replaceMask);
                        }
                        desc = truncateString(desc, 2045)
                        const courseCode = courseName.split(' ')[0]
                        concernsMessage = ''
                        if (allowmentions) {
                            concernsMessage = `${courseCode}: ${itemData.title}\n(${feedData.studentRoleId == 'everyone' ? '@everyone' : `<@&${feedData.studentRoleId}>`})`
                        }
                        else {
                            concernsMessage = `${courseCode}: ${itemData.title}`
                        }
                        concernsChannel = `<#${feedData.courseChannelId}>`
                        this.sendAnnouncement({
                            "author": {
                                "name": "Brightspace",
                                "url": "https://brightspace.tudelft.nl/",
                                "icon_url": "https://www.amsterdamuas.com/binaries/twocolumnlandscape/content/gallery/subsites/dlo/nieuwsberichten/logo-brightspace-b.png"
                            },
                            "title": `${courseName}`, // ${itemData.title}`,
                            "url": itemData.link,
                            "description": desc,
                            "timestamp": itemData.isoDate //,
                            // "fields": [{
                            //     "name": "Concerns",
                            //     "value": concernsMessage
                            // }]
                        }, webhookId, webhookToken, client, channelId, concernsMessage, concernsChannel, migrated, diverted)
                        guids[guildId].push(itemId)
                    }
                }
            }
        }
    }
    moduleData.set("guids", guids)
}

module.exports.sendAnnouncement = async (embed, webhookId, webhookToken, client, channelId, concernsMessage, concernsChannel, migrated, diverted) => {
    if (!migrated) {
        webhookClient = new WebhookClient(webhookId, webhookToken)
        result = await webhookClient.send({
            embeds: [embed]
        })
    } else {
        // Migrated behaviour
        try {
            embed['fields'] = [{
                "name": "Concerns",
                "value": concernsChannel
            }]
            if (diverted) {
                channel = await client.channels.fetch("840521550553415690")
            } else {
                channel = await client.channels.fetch(channelId)
            }
            result = await channel.send(`${concernsMessage}`, {
                embed: embed
            })
        } catch (e) {
            console.log(e)
        }

    }
}

/*

setups: {
    "12345": // Guild
    {
        "884238783294": // Channel
        {
            webhookUrl: "",
            feeds: [
                {courseChannelId: "3883838", studentRoleId: "3293878329", feedUrl: "dwsda"}
            ]
        }
    }
}

*/