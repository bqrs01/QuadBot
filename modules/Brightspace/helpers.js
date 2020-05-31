const Parser = require('rss-parser');
let parser = new Parser();
const {WebhookClient, Webhook} = require("discord.js")
const crypto = require('crypto')
const {
    moduleData
} = require('./index')


module.exports.checkFeedsAndUpdate = async () => {
    const guids = moduleData.ensure('guids', [])
    const names = moduleData.ensure('names', [])
    const setups = moduleData.get('setups')
    for (let setup in setups) {
        if (!setups.hasOwnProperty(setup)) return;
        setupData = setups[setup]
        guildId = setup
        for (let bc in setupData) {
            if (!setupData.hasOwnProperty(bc)) return;
            channelData = setupData[bc]
            channelId = bc
            webhookId = channelData.webhookId
            webhookToken = channelData.webhookToken
            //console.log(channelData)
            for (let feed in channelData.feeds) {
                feedData = channelData.feeds[feed]
                feedUrl = feedData.feedUrl
                courseName = feedData.courseName
                //console.log(feedData)
                let fetchedFeed = await parser.parseURL('https://brightspace.tudelft.nl/d2l/le/news/rss/191905/course?token=asl18nghh9vk3cw678d6');
                for (let item in fetchedFeed.items) {
                    itemData = fetchedFeed.items[item]
                    if (!guids.includes(itemData.guid)) {
                        desc = `**${itemData.title}**\n${itemData.contentSnippet}`
                        for (var i = 0; i < names.length; i++) {
                            var searchMask = names[i];
                            var regEx = new RegExp(searchMask, "ig");
                            var replaceMask = "student";

                            desc = desc.replace(regEx, replaceMask);
                        }
                        this.sendAnnouncement({
                            "author": {
                                "name": "Brightspace",
                                "url": "https://brightspace.tudelft.nl/",
                                "icon_url": "https://www.amsterdamuas.com/binaries/twocolumnlandscape/content/gallery/subsites/dlo/nieuwsberichten/logo-brightspace-b.png"
                            },
                            "title": `${courseName}`,// ${itemData.title}`,
                            "url": itemData.link,
                            "description": desc,
                            "timestamp": itemData.isoDate,
                            "fields": [
                                {
                                    "name": "Concerns",
                                    "value": `<#${feedData.courseChannelId}> (<@&${feedData.studentRoleId}>)`
                                }	
                            ]
                        }, webhookId, webhookToken)
                        guids.push(itemData.guid)
                    }
                }
            }
        }
    }
    moduleData.set("guids", guids)
}

module.exports.sendAnnouncement = async (embed, webhookId, webhookToken) => {
    webhookClient = new WebhookClient(webhookId, webhookToken)
    result = await webhookClient.send({embeds: [embed]})
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