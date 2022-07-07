const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    category: 'Staff',
    data: new SlashCommandBuilder()
        .setName('createevent')
        .setDescription('create a new event.')
        .addStringOption(opt => opt
            .setName("event_name")
            .setDescription("Name for the event")
            .setRequired(true))
        .addStringOption(opt => opt
            .setName("event_time_in_unix")
            .setDescription("Date and time for the event (in UNIX)")
            .setRequired(true))
        .addStringOption(opt => opt
            .setName("event_address")
            .setDescription("Address for event")
            .setRequired(true))
        .addStringOption(opt => opt
            .setName("event_description")
            .setDescription("Description for event (info)")
            .setRequired(true)),

    async execute(interaction) {

        if (!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return interaction.reply({ content: "You don't have permissions to do this command (`KICK_MEMBERS`)", ephemeral: true })

        const total_chars = interaction.options.getString("event_description").length + interaction.options.getString("event_time_in_unix").length + interaction.options.getString('event_address').length

        if (total_chars >= 2000) return interaction.reply({ content: `Description is too long! It has to be under 2000 characters! It's currently at ${total_chars}`, ephemeral: true })

        interaction.reply({ content: "Event created!", ephemeral: true })

        const eventEmbed = new MessageEmbed()
            .setTitle(interaction.options.getString("event_name"))
            .setDescription(`**Event Description:** ${interaction.options.getString("event_description")}
            \n**Date & Time:** <t:${interaction.options.getString("event_time_in_unix")}:F>\n**Address:** ${interaction.options.getString("event_address")}\n`)
            .addField("[✅] Attending:", "List:", true)
            .addField("[🤷‍♂️] Maybe:", "List:", true)
            .addField("[❌] Not attending:", "List:", true)
            .setFooter({ text:`Event created by: ${interaction.user.username}`, iconURL:`${interaction.user.displayAvatarURL()}` })
            .setColor("RANDOM")
        
        const buttons = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('attending_event')
                .setLabel('[✅] Going')
                .setStyle("SUCCESS"))
        .addComponents(
            new MessageButton()
                .setCustomId('maybe_attending_event')
                .setLabel('[🤷‍♂️] Maybe')
                .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
                .setCustomId('not_attending_event')
                .setLabel('[❌] Not Going')
                .setStyle('DANGER')
        )
        interaction.channel.send({ embeds: [eventEmbed], components: [buttons]})
    },
};