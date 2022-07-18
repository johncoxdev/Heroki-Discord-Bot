const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors } = require('discord.js');
const { User } = require('../../databases/userdb.js');

module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Leaderboards for all categories.'),

    async execute(interaction) {
        const RPSTopWins = await User.findAll({
            limit: 3,
            order: [['userWinsRPS', 'DESC']]
        });
        const TTTTopWins = await User.findAll({
            limit: 3,
            order: [['userWinsTTT', 'DESC']]
        });
        const AllTimeWins = await User.findAll({
            limit: 3,
            order: [['userTotalWins', 'DESC']]
        });

        const leaderboardEmbed = new EmbedBuilder()
        .setTitle('Leaderboards')
        .setColor(Colors.LuminousVividPink)
        .addFields([
            {
                name: "RPS Top Winners", 
                value: "loading...", 
                inline: true
            },
            {
                name: "TTT Top Winners",
                value: "loading...",
                inline: true
            },
            {
                name: "All-time Top Winners",
                value: "loading...",
                inline: true
            }
        ])

        for (let i = 0; i < leaderboardEmbed.fields.length; i++){
            leaderboardEmbed.fields[i].value = leaderboardEmbed.fields[i].value.split("loading...").pop()
        }
        
        for (const mem of RPSTopWins){
            leaderboardEmbed.fields[0].value = leaderboardEmbed.fields[0].value.split("loading...").pop()
            leaderboardEmbed.fields[0].value = leaderboardEmbed.fields[0].value.concat(`<@${mem.userID}> - ${mem.userWinsRPS}\n`)
        }
        for (const mem of TTTTopWins){
            leaderboardEmbed.fields[1].value = leaderboardEmbed.fields[1].value.split("loading...").pop()
            leaderboardEmbed.fields[1].value = leaderboardEmbed.fields[1].value.concat(`<@${mem.userID}> - ${mem.userWinsTTT}\n`)
        }
        for (const mem of AllTimeWins){
            leaderboardEmbed.fields[2].value = leaderboardEmbed.fields[2].value.split("loading...").pop()
            leaderboardEmbed.fields[2].value = leaderboardEmbed.fields[2].value.concat(`<@${mem.userID}> - ${mem.userTotalWins}\n`)
            
        }
        return interaction.reply({ embeds: [leaderboardEmbed] })
    },
};