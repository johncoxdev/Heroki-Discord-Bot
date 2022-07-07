const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { Server } = require('../../databases/serverdb.js');
const { User } = require('../../databases/userdb.js');

module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Look for teammates. (You will tag the role!)')
        .addStringOption(opt => opt
            .setName("game")
            .setDescription("game you need teammates for!")
            .setRequired(true)),

    async execute(interaction) {
        const unixTime = Math.floor((new Date().getTime()/1000) + 10*60)
        const serverExistdb = await Server.findOne({ where: { serverID: interaction.guild.id } });
	
		if (!serverExistdb) return interaction.reply({ content: "**[ERROR]:** Server not in database. Please use /setup!", ephemeral: true });

        const foundUser = await User.findOne({ where: { userID: interaction.user.id } });
        
        if (!foundUser) return interaction.reply({ content: "**[ERROR]:** You are not in the database! Tell a staff member to add you to it!", ephemeral: true });

        if (foundUser.userCommandBanned) return interaction.reply({ content: 'You are banned from using this command!', ephemeral: true });

        const teammateRoleExist = await interaction.guild.roles.cache.find(role => role.name === "Mochi-Teammates");

        if (!teammateRoleExist) return interaction.reply({ content: "**[ERROR]:** Taggable role does not exist! Please use /setup!", ephemeral: true });
        if (interaction.options.getString("game").length > 100) return interaction.reply({ content: 'Game title too long! Try again!', ephemeral: true });
        

        const inviteEmbed = new MessageEmbed()
        .setTitle("Game Invite!")
        .setDescription(`${interaction.user} is looking for teammates for **${interaction.options.getString("game")}**!\n\n*Click the join button below to notify that you're wanting to join them!*`)
        .addField("__**Invite Expiration:**__", `<t:${unixTime}:R>`)
        .setColor("RANDOM")
        .setFooter({ text: `${interaction.user.id}` });

        const button = new MessageActionRow()
            .addComponents( 
                new MessageButton()
                .setCustomId('invite_add')
                .setLabel("Join")
                .setStyle("SUCCESS")
            )

        return interaction.reply({ content: `${teammateRoleExist}`, embeds: [inviteEmbed], components: [button] });
    },
};