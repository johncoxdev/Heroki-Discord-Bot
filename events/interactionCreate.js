const { InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	execute(interaction, commands) {
		if (interaction.type !== InteractionType.ApplicationCommand) return;

		const command = commands.get(interaction.commandName);

		if (!command) return;

		try {
			command.execute(interaction);
		} catch (error) {
			console.error(error);
		}	
	},
};