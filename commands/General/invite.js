const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Colors } = require('discord.js')
const { Server } = require('../../databases/serverdb.js');
const { User } = require('../../databases/userdb.js');

module.exports = {
    enabled: false,
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Look for teammates. (You will tag the role!)')
        .addRoleOption( opt => opt
            .setName("gamerole")
            .setDescription("The game you want to ping")
            .setRequired(true)
            ),

    async execute(interaction) {
        const unixTime = Math.floor((new Date().getTime()/1000) + 10*60)
        const serverExistdb = await Server.findOne({ where: { serverID: interaction.guild.id } });

        if (interaction.channel.name !== "🎀game-invites") return interaction.reply({ content: "**[ERROR]:** You cannot do this command in this channel. Please go to #🎀game-invites", ephemeral: true })
	
		if (!serverExistdb) return interaction.reply({ content: "**[ERROR]:** Server not in database. Please use /setup!" });

        const foundUser = await User.findOne({ where: { userID: interaction.user.id } });
        
        if (!foundUser) return interaction.reply({ content: "**[ERROR]:** You are not in the database! Tell a staff member to add you to it!" });

        if (foundUser.userCommandBanned) return interaction.reply({ content: 'You are banned from using this command!', ephemeral: true });

        const getRoleSelected = interaction.options.getRole("gamerole")

        if (!getRoleSelected.name.endsWith("(Game)")) return interaction.reply({ content: "You cannot tag this role, chose a game role!", ephemeral: true });

        const inviteEmbed = new EmbedBuilder()
        .setTitle("Game Invite!")
        .setDescription(`${interaction.user} is looking for teammates for **${interaction.options.getRole("gamerole")}**!\n\n*Click the join button below to notify that you're wanting to join them!*`)
        .addFields([
            {
            name:"__**Invite Expiration:**__",
            value: `<t:${unixTime}:R>`
            }
        ])
        .setColor(Colors.DarkPurple)
        .setFooter({ text: `${interaction.user.id}` });

        const button = new ActionRowBuilder()
            .addComponents( 
                new ButtonBuilder()
                .setCustomId('invite_add')
                .setLabel("Join")
                .setStyle(3)
            )

        await interaction.channel.send({ content: `${getRoleSelected}`, embeds: [inviteEmbed], components: [button] });
        return await interaction.reply({ content: "Invite Created", ephemeral: true });
    },
};