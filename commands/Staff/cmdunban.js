const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../../databases/userdb.js');
const { Server } = require('../../databases/serverdb.js');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    enabled: false,
    category: 'Staff',
    data: new SlashCommandBuilder()
        .setName('cmdunban')
        .setDescription('Unban a user from using Mochi invite command.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to unban')
            .setRequired(true)),
        
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)){
            return interaction.reply({ content: 'Invalid Permissions. (`BAN_MEMBERS`)', ephemeral: true });
        }

        const serverExistdb = await Server.findOne({ where: { serverID: interaction.guild.id } });

		if (!serverExistdb) return interaction.reply({ content: "**[ERROR]:** Server not in database. Tell staff to use `/setup`!", ephemeral: true });

        const getBanned = interaction.options.getMember('user');
        
        if (getBanned.user.bot) return interaction.reply({ content: "You cannot unban a bot!", ephemeral: true });
        if (getBanned.id == interaction.user.id) return interaction.reply({ content: "You cannot unban yourself!", ephemeral: true });

        const foundUser = await User.findOne({ where: { userID: getBanned.id }})

        if (!foundUser) return interaction.reply({ content: "Cannot find user in database!", ephemeral: true})

        const checkIfBanned = foundUser.userCommandBanned

        if (!checkIfBanned) return interaction.reply({ content: "User is not banned!", ephemeral: true });

        await User.update({ userCommandBanned: false }, { where: { UserID: getBanned.id} });
        interaction.reply({ content: `${getBanned.user.username} is now unbanned and is able to use Mochi's invite command again!`, ephemeral: true });
        
    },
};