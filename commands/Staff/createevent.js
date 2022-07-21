const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    category: 'Staff',
    data: new SlashCommandBuilder()
        .setName('createevent')
        .setDescription('create a new event.')
        .addStringOption(opt => opt
            .setName("event_name")
            .setDescription("Name for the event")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100))
        .addStringOption(opt => opt
            .setName("event_time_in_unix")
            .setDescription("Date and time for the event (in UNIX)")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(75))
        .addStringOption(opt => opt
            .setName("event_address")
            .setDescription("Address for event")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100))
        .addStringOption(opt => opt
            .setName("event_description")
            .setDescription("Description for event (info)")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(1750)),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: "You don't have permissions to do this command (`KICK_MEMBERS`)", ephemeral: true })

        const total_chars = interaction.options.getString("event_description").length + interaction.options.getString("event_time_in_unix").length + interaction.options.getString('event_address').length

        if (total_chars >= 2000) return interaction.reply({ content: `Description is too long! It has to be under 2000 characters! It's currently at ${total_chars}`, ephemeral: true })

        interaction.reply({ content: "Event created!", ephemeral: true })

        const eventEmbed = new EmbedBuilder()
            .setTitle(interaction.options.getString("event_name"))
            .setDescription(`**Event Description:** ${interaction.options.getString("event_description")}
            \n**Date & Time:** <t:${interaction.options.getString("event_time_in_unix")}:F>\n**Address:** ${interaction.options.getString("event_address")}\n`)
            .addFields([
                {
                    name: "[✅] Attending:",
                    value: "List:", 
                    inline: true
                },
                {
                    name: "[🤷‍♂️] Maybe:", 
                    value: "List:", 
                    inline: true
                },
                {
                    name: "[❌] Not attending:", 
                    value: "List:", 
                    inline: true
                }
            ])
            .setFooter({ text:`Event created by: ${interaction.user.username}`, iconURL:`${interaction.user.displayAvatarURL()}` })
            .setColor("RANDOM")
        
        const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('attending_event')
                .setLabel('[✅] Going')
                .setStyle(3))
        .addComponents(
            new ButtonBuilder()
                .setCustomId('maybe_attending_event')
                .setLabel('[🤷‍♂️] Maybe')
                .setStyle(1)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('not_attending_event')
                .setLabel('[❌] Not Going')
                .setStyle(4)
        )
        interaction.channel.send({ embeds: [eventEmbed], components: [buttons]})
    },
};