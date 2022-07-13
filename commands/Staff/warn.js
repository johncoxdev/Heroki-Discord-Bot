
const { SlashCommandBuilder, ComponentAssertions } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
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
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(4))
        .addStringOption( opt => opt
            .setName("reason")
            .setDescription("reason for warning")
            .setRequired(true)),

    async execute(interaction) {

        if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)){
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
        if (interaction.options.getString("reason").length > 250) return interaction.reply({ content: "Reason too long! Make it shorter (250 Characters max)", ephemeral: true});

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

        const warningEmbed = new MessageEmbed()
        .setTitle("INFRACTION!")
        .addField("Severity Level:", `${severityLevel}`, true)
        .addField("Reason:", `${infractionReason}`, true)
        .setThumbnail(victimUser.displayAvatarURL());
        
        switch(interaction.options.getInteger("severity")){
            case 1:
                let timoutTime = 5 * 60 * 1000;
                warningEmbed.addField("Pubishment:", "Timeout 5 mins (Muted)!", true);
                await victimMember.send({ embeds: [warningEmbed] });
                await victimMember.timeout(timoutTime, `${infractionReason}`);
                break;
            case 2:
                timoutTime = 60 * 60 * 1000;
                warningEmbed.addField("Pubishment:", "Timeout 1 hour (Muted)!", true);
                await victimMember.send({ embeds: [warningEmbed] });
                await victimMember.timeout(timoutTime, `${infractionReason}`);
                break;
            case 3:
                warningEmbed.addField("Pubishment:", "Kicked from server!", true);
                await victimMember.send({ embeds: [warningEmbed] });
                await victimMember.kick(`${infractionReason}`);
                break;
            case 4:
                warningEmbed.addField("Pubishment:", "Ban from server!", true);
                await victimMember.send({ embeds: [warningEmbed] });
                await victimMember.ban({deleteMessageDays: 7, reason: `${infractionReason}` });
                break;
        }

        return interaction.reply({ content: `Warned ${victimUser}`, ephemeral: true});
    },
};