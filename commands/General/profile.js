const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { Server } = require('../../databases/serverdb');
const { User } = require('../../databases/userdb');


module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your profile, or someone elses.')
        .addUserOption(opt => opt
            .setName("user")
            .setDescription("User to show")
            .setRequired(false)),

    async execute(interaction) {

        let getUserOption = interaction.options.getUser('user');
        
        if (getUserOption === null || getUserOption.bot) getUserOption = interaction.user;

        const serverExistdb = await Server.findOne({ where: { serverID: interaction.guild.id } });
	
		if (!serverExistdb) return interaction.reply({ content: "**[ERROR]:** Server not in database. Please use /setup!", ephemeral: true });

        const foundUser = await User.findOne({ where: { userID: getUserOption.id } });
        
        if (!foundUser) return interaction.reply({ content: "**[ERROR]:** You are not in the database! Tell a staff member to add you to it!", ephemeral: true });

        const RPSWins = foundUser.get('userWinsRPS');
        const RPSTotalGames = foundUser.get('userTotalRPSGames');
        const RPSPercentage = ((RPSWins/RPSTotalGames)*100) ?  parseInt((RPSWins/RPSTotalGames)*100) : "0";
        const TTTWins = foundUser.get('userWinsTTT');
        const TTTTotalGames = foundUser.get('userTotalTTTGames');
        const TTTPercentage = ((TTTWins/TTTTotalGames)*100) ?  parseInt((TTTWins/TTTTotalGames)*100) : "0";
        const TotalWins = foundUser.get('userTotalWins');
        const TotalGames = foundUser.get('userTotalGames');
        const TotalPercentage = ((TotalWins/TotalGames)*100) ? parseInt((TotalWins/TotalGames)*100) : "0";

        const profileEmbed = new MessageEmbed()
            .setColor("RANDOM")
            .setThumbnail(getUserOption.displayAvatarURL())
            .setTitle(`${getUserOption.username}'s Profile`)
            .addField("RPS Winrate:", `${RPSWins}/${RPSTotalGames} (\`${RPSPercentage}%\`)`, true)
            .addField("TTT Winrate:", `${TTTWins}/${TTTTotalGames} (\`${TTTPercentage}%\`)`, true)
            .addField("All-Time Winrate:", `${TotalWins}/${TotalGames} (\`${TotalPercentage}%\`)`, true);

        interaction.reply({ embeds: [profileEmbed] });
    },
};