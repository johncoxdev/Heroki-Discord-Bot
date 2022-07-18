
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors } = require('discord.js');


module.exports = {
    category: 'Server Booster',
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Say a message in an embed message!')
        .addStringOption(opt => opt
			.setName('message')
			.setDescription('Your message')
			.setRequired(true)
            .setMinLength(1)
            .setMaxLength(1750)),

    async execute(interaction) {

        const getServerBoostRole = await interaction.member.roles.cache.find(role => role.name === "Server Booster")

        if (!getServerBoostRole) return interaction.reply({ content: "Command is only for server boosters! Try boosting the server to unlock this command!", ephemeral: true })

        const usersMessage = await interaction.options.getString('message')

        const sayBoostEmbed = new EmbedBuilder()
        .setDescription(`${interaction.user.username}: *${usersMessage}*`)
        .setColor(Colors.LuminousVividPink);

        await interaction.reply({ embeds: [sayBoostEmbed] })
    },
};