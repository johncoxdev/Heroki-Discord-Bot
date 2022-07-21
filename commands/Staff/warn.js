
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { User } = require('../../databases/userdb.js');
const { Server } = require('../../databases/serverdb')

module.exports = {
    category: 'Staff',
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('set a warning and severity towards a user')
        .addUserOption( opt => opt 
            .setName("user")
            .setDescription("user to warn")
            .setRequired(true))
        .addIntegerOption( opt => opt
            .setName("severity")
            .setDescription("What is the severity of the problem [1-]")
            .setMinValue(1)
            .setMaxValue(4)
            .setRequired(true))
        .addStringOption( opt => opt
            .setName("reason")
            .setDescription("reason for warning")
            .setMinLength(1)
            .setMaxLength(250)
            .setRequired(true)),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)){
            return interaction.reply({ content: 'Invalid Permissions. (`BAN_MEMBERS`)', ephemeral: true });
        }

        const serverExistdb = await Server.findOne({ where: { serverID: interaction.guild.id } });

		if (!serverExistdb) return interaction.reply({ content: "**[ERROR]:** Server not in database. Tell staff to use `/setup`!", ephemeral: true });

        const victimMember = interaction.options.getMember("user");
        const victimUser = interaction.options.getUser("user");
        const getUser = await User.findOne({ where: { userID: victimUser.id } });

        if (!getUser) return interaction.reply({ content: "Cannot find user in database!", ephemeral: true});
        if (victimUser.id === interaction.user.id) return interaction.reply({ content: "You cannot do this to yourself!", ephemeral: true});
        if (!victimMember.bannable) return interaction.reply({ content: "This person is not bannable!", ephemeral: true});

        const dateObj = new Date();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDay();
        const year = dateObj.getFullYear();
        const getDBData = getUser.userWarnHistory;
        const data = JSON.parse(JSON.stringify(getDBData));
        const index = Object.keys(data).length + 1;
        const severityLevel = interaction.options.getInteger("severity");
        const infractionReason = interaction.options.getString("reason");

        data[index] = {
            "severity": severityLevel,
            "reason": infractionReason,
            "date": `${month}/${day}/${year}`
        };

        await getUser.update({ userWarnHistory: data });

        const warningEmbed = new EmbedBuilder()
        .setTitle("INFRACTION!")
        .addFields([
            {
                name: "Severity Level:", 
                value: `${severityLevel}`, 
                inline: true
            },
            {
                name: "Reason:", 
                value: `${infractionReason}`, 
                inline: true
            }
        ])
        .setThumbnail(victimUser.displayAvatarURL());
        
        switch(interaction.options.getInteger("severity")){
            case 1:
                let timoutTime = 5 * 60 * 1000;
                warningEmbed.addFields([
                    {
                        name: "Pubishment:",
                        value: "Timeout 5 mins (Muted)!",
                        inline: true
                    }
                ])
                await victimMember.send({ embeds: [warningEmbed] });
                await victimMember.timeout(timoutTime, `${infractionReason}`);
                break;
            case 2:
                timoutTime = 60 * 60 * 1000;
                warningEmbed.addFields([
                    {
                        name: "Pubishment:",
                        value: "Timeout 1 hour (Muted)!",
                        inline: true
                    }
                ])
                await victimMember.send({ embeds: [warningEmbed] });
                await victimMember.timeout(timoutTime, `${infractionReason}`);
                break;
            case 3:
                warningEmbed.addFields([
                    {
                        name: "Pubishment:",
                        value: "Kicked from server!",
                        inline: true
                    }
                ])
                await victimMember.send({ embeds: [warningEmbed] });
                await victimMember.kick(`${infractionReason}`);
                break;
            case 4:
                warningEmbed.addFields([
                    {
                        name: "Pubishment:",
                        value: "Ban from server!",
                        inline: true
                    }
                ])
                await victimMember.send({ embeds: [warningEmbed] });
                await victimMember.ban({deleteMessageDays: 7, reason: `${infractionReason}` });
                break;
        }

        return interaction.reply({ content: `Warned ${victimUser}`, ephemeral: true});
    },
};