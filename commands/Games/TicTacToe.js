const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { User } = require('../../databases/userdb');

async function checkGame(newButtons, player){
    const allEl = (el) => el != 'SECONDARY';
    const isFilled = newButtons.every(allEl)
    if (
        //horizontal
        ((newButtons[0] === player[2] && newButtons[1] === player[2] && newButtons[2] === player[2])) ||
        ((newButtons[3] === player[2] && newButtons[4] === player[2] && newButtons[5] === player[2])) ||
        ((newButtons[6] === player[2] && newButtons[7] === player[2] && newButtons[8] === player[2])) || 
        //vertical
        ((newButtons[0] === player[2] && newButtons[3] === player[2] && newButtons[6] === player[2])) ||
        ((newButtons[1] === player[2] && newButtons[4] === player[2] && newButtons[7] === player[2])) ||
        ((newButtons[2] === player[2] && newButtons[5] === player[2] && newButtons[8] === player[2])) ||
        //diagnol
        ((newButtons[0] === player[2] && newButtons[4] === player[2] && newButtons[8] === player[2])) ||
        ((newButtons[2] === player[2] && newButtons[4] === player[2] && newButtons[6] === player[2]))
        ) {
            return [1, player[0]]
        } else if (isFilled) {
            return [-1, player[0]]
        } else {
            return [0]
        }
        
}

module.exports = {
    enabled: true,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('ttt')
        .setDescription('Play tic-tac-toe with a user!')
        .addUserOption(opt => opt
            .setName("user")
            .setDescription("User to show")
            .setRequired(true)),

    async execute(interaction) {
        const getPlayer = interaction.user;
        const getOpponent = interaction.options.getMember('user');
        const playerEmote = "❌"
        const opponentEmote = "⭕" 
        const playerColor = "DANGER" //red
        const opponentColor  = "PRIMARY" //blue
        const msg = `${getPlayer} has challenged ${getOpponent} to a game of __**Tic-Tac-Toe**__ \n*${getPlayer} will start the game!*\n**Warning:** You have 30 seconds per play!`
        let buttons = [] 
        let count = 1
        let gameDone = false

        if (getOpponent.user.bot || getOpponent.presence === null) return interaction.reply("You cannot choose this person. You've either chosen a bot, or this person is offline! Try someone else.")

        for (let i = 0; i < 3; i++){
            let actionRow = new ActionRowBuilder()
            for (let i = 0; i < 3; i++){
                actionRow.addComponents(new ButtonBuilder()
                    .setCustomId(String(count))
                    .setLabel(" ")
                    .setStyle(2))
                count++
            }
            buttons.push(actionRow)
        }

        const sentMessage = await interaction.reply({ content: msg , components: [buttons[0], buttons[1], buttons[2]], fetchReply: true });
        let finalMessage = msg.replace(`*${getPlayer} will start the game!*\n`, ``);
        let currentPlayer = [getPlayer, playerEmote, playerColor]
        const playerDB = await User.findOne({ where: { userID: getPlayer.id } });
        const opponentDB = await User.findOne({ where: { userID: getOpponent.id } })
        const filter = i => i.user.id === currentPlayer[0].id && i.message.id === sentMessage.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });
        collector.on('collect', async i => {
            let buttonList = []
            for (let x of buttons){
                for (let y of x.components){
                    if (i.customId === y.customId){
                        y.label = currentPlayer[1];
                        y.style = currentPlayer[2];
                        y.disabled = true;
                    }
                    buttonList.push(String(y.style))
                }
            }

            const gameState = await checkGame(buttonList, currentPlayer)

            currentPlayer = (currentPlayer[0] === getPlayer) ? [getOpponent, opponentEmote, opponentColor] : [getPlayer, playerEmote, playerColor]
            if (gameState[0] === 1){
                finalMessage = `${gameState[1]} has won the game!`
                if (playerDB && gameState[1] == getPlayer){
                    await playerDB.increment(["userWinsTTT", "userTotalTTTGames", "userTotalWins", "userTotalGames"]);
                    if (opponentDB) await opponentDB.increment(["userTotalTTTGames", "userTotalGames"])
                }
                if (opponentDB && gameState[1] == getOpponent){
                    await opponentDB.increment(["userWinsTTT", "userTotalTTTGames", "userTotalWins", "userTotalGames"]);
                    if (playerDB) await playerDB.increment(["userTotalTTTGames", "userTotalGames"])
                }
                gameDone = true
                collector.stop()
                return i.update({ content: finalMessage, components: [buttons[0], buttons[1], buttons[2]] })

            } else if (gameState[0] === -1) {
                finalMessage = `${gameState[1]} has tied the game. No winner!`
                gameDone = true
            }
            collector.resetTimer()
            return i.update({ content: finalMessage, components: [buttons[0], buttons[1], buttons[2]] })
        });

        collector.on('end', async i => {
            if (gameDone == true){
                return
            }
            if (i.size === undefined || i.size === 0 || i.size === 1){
                return sentMessage.edit({ content: `${currentPlayer[0]} did not respond back! Game has been cancelled!`, components: [] })
            }
            if (i.size < 9  && i.size){
                if (opponentDB && currentPlayer[0] == getPlayer){
                    await opponentDB.increment(["userWinsTTT", "userTotalTTTGames", "userTotalWins", "userTotalGames"]);
                    if (playerDB) await playerDB.increment(["userTotalTTTGames", "userTotalGames"])
                }
                if (playerDB && currentPlayer[0] == getOpponent){
                    await playerDB.increment(["userWinsTTT", "userTotalTTTGames", "userTotalWins", "userTotalGames"]);
                    if (opponentDB) await opponentDB.increment(["userTotalTTTGames", "userTotalGames"])
                }
                return sentMessage.edit({ content: `${currentPlayer[0]} did not respond after initiating their move! Win was given to their opponent`, components: [] })
            }
        });

    },
};