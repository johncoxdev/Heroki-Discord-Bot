const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('love')
        .setDescription('How much do you truly love this person?')
        .addUserOption(opt => opt
            .setName("user")
            .setDescription("User to show")
            .setRequired(true)),

    async execute(interaction) {

        const getUser = await interaction.options.getUser('user')

        if(getUser == interaction.user) return interaction.reply({ content: "Don't be obsessed with yourself. Choose someone else.", ephemeral: true })
        if(getUser.bot) return interaction.reply({ content: "You picked a bot... They cannot love you", ephemeral: true })
        
        let blankSpace = "⬛" 
        let heartAmount = "❤️"
        heartAmount = heartAmount.repeat(Math.random()*11)
        blankSpace = blankSpace.repeat(10 - heartAmount.length/2)

        const loveEmbed = new MessageEmbed()
        .setTitle(`How much does ${interaction.user.username} love ${getUser.username}?`)
        .setDescription(`Love Meter: ${heartAmount}${blankSpace}`)
        .setColor(16736498);

        await interaction.reply({ embeds: [loveEmbed] })
    },
};