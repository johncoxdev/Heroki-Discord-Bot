const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Colors } = require('discord.js');
const { User } = require('../../databases/userdb');

async function checkGame(bot, member){
    if (bot == member) return "Tie"
    if ((bot == 'paper') && (member == 'scissor')) return "winner"
    if ((bot == 'rock') && (member == 'paper')) return "winner"
    if ((bot == 'scissor') && (member == 'rock')) return "winner"
    return "loser"
}

module.exports = {
    enabled: true,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play rock, paper, scissor with a user or a bot!')
        .addStringOption(opt => opt
            .setName("choice")
            .setDescription("Your choice.")
            .setRequired(true)
            .addChoices({
                name: '🗿-Rock',
                value: 'rock'
            },{
                name: '📜-Paper',
                value: 'paper'
            },{
                name: '✂️-Scissor',
                value: 'scissor'
            }))
        .addUserOption(opt => opt
            .setName("user")
            .setDescription("user you wanna challenege [optional].")
            .setRequired(false)),

    async execute(interaction) {

        const getUser = await interaction.options.getMember('user');
        const getInitialChoice = await interaction.options.getString('choice');
        
        if (getUser === interaction.member) return interaction.reply({ content: "You cannot pick yourself.", ephemeral: true })

        if (getUser === null || getUser.user.bot){
            const choices = ['rock', 'paper', 'scissor']
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            
            const gameDecision = await checkGame(botChoice, getInitialChoice)

            const gameEmbed = new EmbedBuilder()
                .setTitle("Rock, Paper, Scissors")
                .setDescription(`(${interaction.options.getString("choice")}) ${interaction.user.username} *VS* Bot (${botChoice}) \n**Results:** __${gameDecision}__`)
                .setColor(Colors.DarkPurple)

            return await interaction.reply({embeds: [gameEmbed] })
        }

        if (getUser.presence === null) return interaction.reply({ content: "This user is offline. You cannot pick them!", ephemeral: true })

        const buttons = new ActionRowBuilder()
            .addComponents(
                new MessageButton()
                    .setCustomId("rock")
                    .setLabel("🗿-Rock")
                    .setStyle(1))
            .addComponents(
                new MessageButton()
                    .setCustomId("paper")
                    .setLabel("📜-Paper")
                    .setStyle(1))
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("scissor")
                    .setLabel("✂️-Scissor")
                    .setStyle(1));

        const challengeEmbed = new EmbedBuilder()
            .setTitle("New Challenge!")
            .setDescription(`${getUser}, please choose one of your options below! \n*You have 15 seconds to respond!*`);

        const sentMessage = await interaction.reply({ content: `${interaction.user} has challenged ${getUser} to a game of __Rock, Paper, Scissor__`, embeds: [challengeEmbed], components: [buttons], fetchReply: true });

        const filter = i => i.user.id === getUser.id && i.message.id === sentMessage.id;

        const collector = interaction.channel.createMessageComponentCollector({filter, time: 10000 });

        collector.on('collect', async i => {
            const gameDecision = await checkGame(getInitialChoice, i.customId)

            challengeEmbed.title = undefined
            challengeEmbed.description = undefined
            challengeEmbed.addFields([
                {
                name: "Results:",
                value: ` (${i.customId}) ${getUser} is the **${gameDecision}** against ${interaction.user} (${getInitialChoice})`
                }
            ])
            
            const getOpponent = await User.findOne({ where: { userID: getUser.id } });
            const getPlayer = await User.findOne ({ where: { userID: interaction.user.id } })


            if (!getOpponent && !getPlayer) return i.update({ content: "Game completed", embeds: [challengeEmbed], components: [] });

            if (gameDecision === 'loser'){
                if (getPlayer) {
                    await getPlayer.increment(["userWinsRPS", "userTotalRPSGames", "userTotalWins", "userTotalGames"]);
                }
                if (getOpponent) {
                    await getOpponent.increment(["userTotalRPSGames", "userTotalGames"])
                }
            }
            if (gameDecision === 'winner'){
                if (getOpponent) {
                    await getOpponent.increment(["userWinsRPS", "userTotalRPSGames", "userTotalWins", "userTotalGames"]);
                }
                if (getPlayer) {
                    await getPlayer.increment(["userTotalRPSGames", "userTotalGames"])
                }
            }
            return i.update({ content: "Game completed", embeds: [challengeEmbed], components: [] });
        });

        collector.on('end', async i => {
            if (i.size === undefined || i.size === 0){
                challengeEmbed.title = undefined
                challengeEmbed.description = undefined
                challengeEmbed.fields = undefined
                challengeEmbed.setTitle("Game Cancelled!")
                challengeEmbed.setDescription(` ${getUser} did not respond!`)
                return sentMessage.edit({ embeds: [challengeEmbed], components: [] })
            }
        });
        
    },
};