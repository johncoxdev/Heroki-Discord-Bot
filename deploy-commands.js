const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { CLIENT_ID, GUILD_ID, TOKEN } = require('./botconfig.json');

const commands = [];

const commandFolders = fs.readdirSync('./commands')

for (const subFolder of commandFolders){
	const commandFiles = fs.readdirSync(`./commands/${subFolder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles){
		const command = require(`./commands/${subFolder}/${file}`)
		if (command.enabled){
			console.log(command.data.name)
  			commands.push(command.data.toJSON());		
		}
	}
}

const rest = new REST({ version: '9' }).setToken(TOKEN);

rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

