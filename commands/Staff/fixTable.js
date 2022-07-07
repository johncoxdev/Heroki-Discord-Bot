const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../../databases/initdb.js');
const Sequelize = require('sequelize');

module.exports = {
    category: 'Staff',
    data: new SlashCommandBuilder()
        .setName('fixtable')
        .setDescription('fix datatable'),

    async execute(interaction) {
        
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('userdbs', 'userCommandBanned', { 
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }).catch( error => 
            interaction.channel.send("Column has already been added!" )

        );
        return interaction.reply("database has been updated!")
    },
};