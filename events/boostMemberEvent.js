const { Server } = require('../databases/serverdb.js');
const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
	name: 'guildMemberUpdate',
	async execute(oldMember, newMember) {
        if (oldMember.premiumSince !== newMember.premiumSince) {
            const foundServer = await Server.findOne({ where: { ServerID: oldMember.guild.id } })
            const boostChannel = foundServer.serverBoostChannelID

            if (!boostChannel) return oldMember.send("Tell the staff that no Boosted channel has been set!");

            const fetchedChannel = await oldMember.guild.channels.cache.get(boostChannel)

            if (!fetchedChannel) return oldMember.reply("Tell the staff that no Boosted channel has been set! The server cannot find it!");

            let serverTier = newMember.guild.premiumTier

            if (serverTier == 'NONE') {
                serverTier = 0
            }

            const serverBoostEmbed = new EmbedBuilder()
            .setTitle("**꒦꒷︶꒷︶꒦꒷ NEW SERVER BOOST ꒷꒦︶꒷︶꒷꒦**")
            .setDescription(`${newMember.user} **has boosted the server! Thank you! \nCheck out #📰︱information to see the perks you're not eligible for!**\nServer Boosters: ${newMember.guild.premiumSubscriptionCount}\nServer Tier: ${serverTier}`)
            .setColor(Colors.DarkPurple)
            .setThumbnail('https://i.imgur.com/DzMgO98.gifv')

            await fetchedChannel.send({ embeds: [serverBoostEmbed] })
        }
	},
};