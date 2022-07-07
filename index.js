const fs = require('node:fs');
const { Client, Collection } = require('discord.js');
const { TOKEN } = require('./botconfig.json');


let client = new Client({
	allowedMentions: { parse: ['roles', 'users'], repliedUser: true }, 
    intents: [
        "GUILDS",
		"GUILD_MESSAGES",
		"GUILD_MEMBERS",
		"GUILD_VOICE_STATES",
		"GUILD_PRESENCES"
    ]
});

// Collecting commands from commands folder
client.commands = new Collection();
const commandFolders = fs.readdirSync('./commands')

for (const subFolder of commandFolders){
	const commandFiles = fs.readdirSync(`./commands/${subFolder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles){
		const command = require(`./commands/${subFolder}/${file}`)
  		client.commands.set(command.data.name, command);		
	}
}

// Collecting events from events folder
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client.commands));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client.commands));
	}
}

client.login(TOKEN);

module.exports = {
    client
}