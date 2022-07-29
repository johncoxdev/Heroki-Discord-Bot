const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors } = require('discord.js');
const GameBuilds = require ('../../builds.json');
const { User } = require('../../databases/userdb.js');
const { Server } = require('../../databases/serverdb.js');

/**
 * This will fetch random build from the .json file for any game
 * that it provides to the function. 
 * 
 * @param {interaction.options.getSubcommand()} game_selected 
 * @param {interaction.user} author 
 * @returns {EmbedBuilder}
 */
function get_challenge(game_selected, author) {
	const final_list = {}
	let gameDescription = ""

	// Search all keys of the game, and then selects a random value from that key.
	for (x in GameBuilds[game_selected]){
		let get_random_item = Math.floor(Math.random() * GameBuilds[game_selected][x].length);
		final_list[x] = GameBuilds[game_selected][x][get_random_item];
	}

	// concat the description using the key and value given in the dict.
	for(x in final_list){
		gameDescription = gameDescription.concat(`**${x}**: ${final_list[x]} \n`)
	}

	// Use regex & replaceAll to fix the name of the gama.
	const final_game_name = game_selected.replaceAll("_", " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

	// Build embed and return it.
	let gameEmbed = new EmbedBuilder()
		.setColor(Colors.DarkPurple)
		.setTitle(`Random ${final_game_name} Challenge`)
		.setFooter({ text: `${author.tag}`, iconURL: author.displayAvatarURL() })
		.setDescription(gameDescription)

		return gameEmbed
}

module.exports = {
	enabled: true,
	category: 'General',
	data: new SlashCommandBuilder()
		.setName('challenge')
		.setDescription('Get a challenge for a game!')
		.addStringOption(opt => opt
			.setChoices(
				{
					name: 'apex_legends',
					value: 'apex_legends'
				},
				{
					name: 'forza',
					value: 'forza'
				},
				{
					name: 'league_of_legends',
					value: 'league_of_legends'
				}
			)
			.setName('games')
			.setDescription('Select game to get Challenge')
			.setRequired(true)),
		
	async execute(interaction) {
		const game_embed = get_challenge(interaction.options.getString('games'), interaction.user)
		await interaction.reply({ embeds: [game_embed] })
	},
};