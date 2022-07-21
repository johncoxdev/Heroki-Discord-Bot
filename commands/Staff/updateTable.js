const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const { User, addMemberDatabase } = require('../../databases/userdb.js');

module.exports = {
	category: 'Staff',
	data: new SlashCommandBuilder()
		.setName('update_table')
		.setDescription('Iterate through all members and add all members who may not be a part of the database.'),
		
	async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            return interaction.reply({ content: 'Invalid Permissions. (`ADMINISTRATOR`)', ephemeral: true });
        }

        for (const mem of interaction.guild.members.cache){
            const foundUser = await User.findOne({ where: { userID: mem[0]}})

            if (foundUser) continue;

            addMemberDatabase(mem[1])
            await interaction.channel.send(`added \`${mem[1].user.username}\``)
        }
        interaction.reply("update finished!")

	},
};