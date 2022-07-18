const fs = require('node:fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Colors } = require('discord.js');

function getButtonStatus(pageID, length){
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_previous_page')
                .setEmoji('⏪')
                .setStyle(1)
                .setDisabled(pageID === 0))
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_next_page')
                .setEmoji('⏩')
                .setStyle(1)
                .setDisabled(pageID === length - 1))
    return buttons
}

async function createEmbeds(commandData){
    const embeds = []
    for (const [key, value] of Object.entries(commandData)){
        let finalString = ""
        for (const index of value){
            finalString = finalString.concat(`/${index[0]} - ${index[1]}\n`)
        }
        embeds.push(
            new EmbedBuilder()
            .setTitle(`${key.replace("_", " ")} Commands`)
            .setDescription(`${finalString}`)
            .setColor(Colors.LuminousVividPink)
        )
    }
    for (let i = 0; i < embeds.length; i++){
        let prev = ""
        let next = ""

        if (embeds[i-1] !== undefined) prev = '⏪' + embeds[i-1].title;

        if (embeds[i+1] !== undefined) next = embeds[i+1].title + '⏩';

        embeds[i] = embeds[i].setFooter({ text:`${prev} | ${next}` })
    }
    return embeds
}



module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all commands avaliable.'),

    async execute(interaction) {

        let userPage = 0
        const commandData = {
            "General": [],
            "Game": [],
            "Server Booster": [],
            "Staff": []
        }

        const commandFolders = fs.readdirSync('./commands')

        for (const subFolder of commandFolders){
            const commandFiles = fs.readdirSync(`./commands/${subFolder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles){
                const cmd = require(`../../commands/${subFolder}/${file}`)
                commandData[cmd.category].push([cmd.data.name, cmd.data.description])
            }
        }

        const helpEmbeds = await createEmbeds(commandData)
        const buttons = getButtonStatus(userPage, helpEmbeds.length)
        
        const sentMessage = await interaction.reply({ embeds: [helpEmbeds[userPage]], components: [buttons], ephemeral: true, fetchReply: true })
        const filter = i => i.message.id === sentMessage.id;
        const collector = interaction.channel.createMessageComponentCollector({filter, time: 15000 });

        collector.on('collect', async i => {
	        if (i.customId === 'help_previous_page') {
                userPage = userPage - 1
                const buttons = getButtonStatus(userPage, helpEmbeds.length)
                collector.resetTimer()
		        i.update({embeds: [helpEmbeds[userPage]], components: [buttons], ephemeral: true });
	        }
            if (i.customId === 'help_next_page') {
                userPage = userPage + 1
                const buttons = getButtonStatus(userPage, helpEmbeds.length)
                collector.resetTimer()
		        i.update({embeds: [helpEmbeds[userPage]], components: [buttons], ephemeral: true });
	        }
        });
    },
};