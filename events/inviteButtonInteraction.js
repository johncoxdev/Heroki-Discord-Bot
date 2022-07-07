module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {

		if (!interaction.isButton()) return;

		if(interaction.customId === "invite_add"){
			const message = interaction.message
			const embed = interaction.message.embeds[0]
			const userID = embed.footer.text

			// Check if invite is expired, if so, remove button
			if (Math.floor((new Date().getTime()/1000)) > interaction.message.embeds[0].fields[0].value.slice(3, -3)) {
				embed.description = "This invite has expired!"
				embed.title = "~~Game Invite~~"
				embed.fields = undefined
				await message.edit({ embeds: [embed], components: [] }).catch(err => interaction.channel.send("Message is gone, cannot edit!"))
				return interaction.reply({ content: "Sorry, this invite has expired! Removing invite button!", ephemeral: true })
			}

			// Check if user is still in the server, if so, remove button
			const getUser = interaction.guild.members.cache.find(user => user.id == userID)
			if (!getUser) {
				embed.description = "This invite has expired!"
				embed.title = "~~Game Invite~~"
				embed.fields = undefined
				await message.edit({ embeds: [embed], components: [] }).catch(err => interaction.channel.send("Message is gone, cannot edit!"))
				return interaction.reply({ content: "Sorry, it seems that the original poster is no longer in the server! Removing invite button!", ephemeral: true })
			}

			if (interaction.member === getUser) return interaction.reply({ content: "You cannot join your own invite!", ephemeral: true });

			interaction.reply(`${getUser}, ${interaction.user} wants to play with you!`)

		}
	}
};

