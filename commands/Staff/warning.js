
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors, PermissionsBitField } = require('discord.js');
const { User } = require('../../databases/userdb.js');
const { Server } = require('../../databases/serverdb')

module.exports = {
    category: 'Staff',
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('set a warning and severity towards a user')
        .addUserOption( opt => opt 
            .setName("user")
            .setDescription("user to warn")
            .setRequired(true)),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)){
            return interaction.reply({ content: 'Invalid Permissions. (`BAN_MEMBERS`)', ephemeral: true });
        }

        const serverExistdb = await Server.findOne({ where: { serverID: interaction.guild.id } });
		if (!serverExistdb) return interaction.reply({ content: "**[ERROR]:** Server not in database. Tell staff to use `/setup`!", ephemeral: true });

        const victimUser = interaction.options.getUser("user");

        const getUser = await User.findOne({ where: { userID: victimUser.id } });
        if (!getUser) return interaction.reply({ content: "Cannot find user in database!", ephemeral: true})

        const getDBData = getUser.userWarnHistory;
        const data = JSON.parse(JSON.stringify(getDBData));
        const totalWarnings = Object.keys(data).length;


        const warningsEmbed = new EmbedBuilder()
        .setColor(Colors.LuminousVividPink)
        .setTitle(`${victimUser.username} Warnings`)
        .setDescription(`Total Warnings: ${totalWarnings} \nShowing first 6 warnings!`)
        .setThumbnail(victimUser.displayAvatarURL());

        if (totalWarnings === 0){
            warningsEmbed.addFields([
                {
                    name: "Warnings:",
                    value: "None",
                    inline: true
                }
            ])
            return interaction.reply({ embeds: [warningsEmbed] });
        }

        let count = 1
        for (const x in data){
            if (count === 6) break;
            warningsEmbed.addFields([
                {
                    name: `Warning #${count}`,
                    value: `Severity: ${data[x].severity}\nReason: ${data[x].reason}\nDate: ${data[x].date}`,
                    inline: true
                }
            ])
            count++
        }

        return interaction.reply({ embeds: [warningsEmbed] });
    },
};