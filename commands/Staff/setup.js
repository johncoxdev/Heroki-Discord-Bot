const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, Colors } = require('discord.js');
const Userdb = require('../../databases/userdb.js');
const Serverdb = require('../../databases/serverdb.js');
var teammateRoleExist

module.exports = {
    enabled: true,
    category: 'Staff',
	data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Initial setup for the bot'),

    async execute(interaction) {

        // Check if user has admin perms to execute command.
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
        return interaction.reply({ content: 'Invalid Permissions. (`ADMINISTRATOR`)', ephemeral: true });
        }

        // Attempts to find the server and role within the server.
        const serverExistdb = await Serverdb.Server.findOne({ where: { serverID: interaction.guild.id } });
        teammateRoleExist = await interaction.guild.roles.cache.find(role => role.name === "Mochi-Teammates");

        await interaction.guild.channels.chache
        const categoryExist = await interaction.guild.channels.cache.find(chn => chn.name === "SG Channels")
        const vcChannelExist = await interaction.guild.channels.cache.find(chn => chn.name === "SG Waiting Lobby")
        const textChannelExist = await interaction.guild.channels.cache.find(chn => chn.name === "sg-game-invites")

        //if everything is setup, ignore rest and move on.
        if (serverExistdb && teammateRoleExist && categoryExist && vcChannelExist && textChannelExist) return interaction.reply("[❌] Setup has already been done. Aborting...");

        //Check to see if server has been added to Database
        if (!serverExistdb){
            Serverdb.inputServerDatabase(interaction.guild.id);
            await interaction.guild.members.fetch();
            await interaction.guild.members.cache.forEach(member => Userdb.addMemberDatabase(member));
            interaction.channel.send("[✅] Added server & members to database.");
        }

        //If role doesn't exist, then create the role
        if (!teammateRoleExist) {
            await interaction.guild.roles.create({
                name: 'Mochi-Teammates',
                color: Colors.Yellow,
                reason: 'Super Gamer Bot role',
                permissions: []
            }).catch(error => interaction.channel.send(`There was an error \`${error}\``));
            await interaction.channel.send("[✅] \"Mochi-Teammates\" role created.");
        }
        await interaction.reply("Setup complete")
    },
};