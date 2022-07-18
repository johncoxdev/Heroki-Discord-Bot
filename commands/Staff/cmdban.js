const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../../databases/userdb.js');
const { Server } = require('../../databases/serverdb.js');

module.exports = {
    category: 'Staff',
    data: new SlashCommandBuilder()
        .setName('cmdban')
        .setDescription('ban a user from using Mochi invite command.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to ban')
            .setRequired(true)),
        
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)){
            return interaction.reply({ content: 'Invalid Permissions. (`BAN_MEMBERS`)', ephemeral: true });
        }

        const serverExistdb = await Server.findOne({ where: { serverID: interaction.guild.id } });

		if (!serverExistdb) return interaction.reply({ content: "**[ERROR]:** Server not in database. Tell staff to use `/setup`!", ephemeral: true });

        const getBanned = interaction.options.getMember('user');
        
        if (getBanned.user.bot) return interaction.reply({ content: "You cannot ban a bot!", ephemeral: true });
        if (getBanned.id == interaction.user.id) return interaction.reply({ content: "You cannot ban yourself!", ephemeral: true });
        if (!getBanned.bannable) return interaction.reply({ content: "You cannot ban this person!", ephemeral: true });

        const foundUser = await User.findOne({ where: { userID: getBanned.id }})

        if (!foundUser) return interaction.reply({ content: "Cannot find user in database!", ephemeral: true})

        const checkIfBanned = foundUser.userCommandBanned

        if (checkIfBanned) return interaction.reply({ content: "User is already banned!", ephemeral: true });

        await User.update({ userCommandBanned: true }, { where: { UserID: getBanned.id} });
        interaction.reply({ content: `${getBanned.user.username} is now banned from using Mochi's invite command!`, ephemeral: true });
        
    },
};