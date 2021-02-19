let {
    moduleData
} = require('../index')

const {Structures} = require('discord.js');

module.exports = async(client, _) => {
    Structures.extend('GuildMember', GuildMember => {
        class GuildMemberWithPending extends GuildMember {
            pending = false;
        
            constructor(client, data, guild) {
                super(client, data, guild);
                this.pending = data.pending || false;
            }
        
            _patch(data) {
                super._patch(data);
                this.pending = data.pending || false;
            }
        }
        return GuildMemberWithPending;
    });
}