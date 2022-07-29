const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const { Server } = require('../../databases/serverdb.js');

module.exports = {
	enabled: true,
	category: 'Staff',
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Set channel id to send boost message.')
		.addChannelOption(opt => opt
			.setName('boost_channel')
			.setDescription('Select channel to send boost message to.')
			.setRequired(true)),
		
	async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            return interaction.reply({ content: 'Invalid Permissions. (`ADMINISTRATOR`)', ephemeral: true });
            }

		//check for server in db
		const serverExistdb = await Server.findOne({ where: { serverID: interaction.guild.id } });
	
		if (!serverExistdb) return interaction.reply({ content: "**[ERROR]:** Server not in database. Please use /setup!", ephemeral: true })
        
		// Check for a boosting channel
        const fetchChannel = interaction.options.getChannel('boost_channel')
		
		if (!fetchChannel) return interaction.reply({ content: "**[ERROR]:** Cannot find that channel. Try a different channel!"})

		// set boost channel
		await Server.update({ serverBoostChannelID: `${fetchChannel.id}` }, { where: { serverID: interaction.guild.id} })

		interaction.reply({ content: `Boosted channel set to ${fetchChannel}!`, ephemeral: true })

	},
};