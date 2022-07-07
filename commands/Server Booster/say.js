
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');


module.exports = {
    category: 'Server Booster',
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Say a message in an embed message!')
        .addStringOption(opt => opt
			.setName('message')
			.setDescription('Your message')
			.setRequired(true)),

    async execute(interaction) {

        const getServerBoostRole = await interaction.member.roles.cache.find(role => role.name === "Server Booster")

        if (!getServerBoostRole) return interaction.reply({ content: "Command is only for server boosters! Try boosting the server to unlock this command!", ephemeral: true })

        const usersMessage = await interaction.options.getString('message')

        if (usersMessage.length > 1750) return interaction.reply({ content: "Your message is too long! Retype your message!", ephemeral: true });

        const sayBoostEmbed = new MessageEmbed()
        .setDescription(`${interaction.user.username}: *${usersMessage}*`)
        .setColor(16736498);

        await interaction.reply({ embeds: [sayBoostEmbed] })
    },
};