const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors } = require('discord.js');
const { Server } = require('../../databases/serverdb');
const { User } = require('../../databases/userdb');


module.exports = {
    enabled: true,
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

        const BumpPoints = foundUser.get("userTotalBumps");
        const RPSWins = foundUser.get('userWinsRPS');
        const RPSTotalGames = foundUser.get('userTotalRPSGames');
        const RPSPercentage = ((RPSWins/RPSTotalGames)*100) ?  parseInt((RPSWins/RPSTotalGames)*100) : "0";
        const TTTWins = foundUser.get('userWinsTTT');
        const TTTTotalGames = foundUser.get('userTotalTTTGames');
        const TTTPercentage = ((TTTWins/TTTTotalGames)*100) ?  parseInt((TTTWins/TTTTotalGames)*100) : "0";
        const TotalWins = foundUser.get('userTotalWins');
        const TotalGames = foundUser.get('userTotalGames');
        const TotalPercentage = ((TotalWins/TotalGames)*100) ? parseInt((TotalWins/TotalGames)*100) : "0";

        const profileEmbed = new EmbedBuilder()
            .setColor(Colors.DarkPurple)
            .setThumbnail(getUserOption.displayAvatarURL())
            .setTitle(`${getUserOption.username}'s Profile`)
            .addFields([
                {
                    name: "Bump Points:",
                    value: `${BumpPoints}`,
                    inline: false
                },
                {
                    name: "RPS Winrate:", 
                    value: `${RPSWins}/${RPSTotalGames} (\`${RPSPercentage}%\`)`, 
                    inline: true
                },
                {
                    name: "TTT Winrate:",
                    value: `${TTTWins}/${TTTTotalGames} (\`${TTTPercentage}%\`)`, 
                    inline: true
                },
                {
                    name: "All-Time Winrate:", 
                    value: `${TotalWins}/${TotalGames} (\`${TotalPercentage}%\`)`, 
                    inline: true
                }
            ]);

        interaction.reply({ embeds: [profileEmbed] });
    },
};