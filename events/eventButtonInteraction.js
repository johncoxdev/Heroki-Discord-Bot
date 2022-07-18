async function find_and_replace(msg, embed, fields, type, user){

	// check for user in any category
	for (let field of fields){
		if (field.value.includes(`${user}`) && (field.name !== type)){
			field.value = field.value.replace(`\n ${user}`, "")
			field.value = field.value.replace(user, "")
		}
		if (field.name === type && !field.value.includes(`${user}`)){
			field.value = field.value.concat(`\n ${user}`)
		}
		msg.edit({ embeds: [embed] })
	}
}


module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {

		if (!interaction.isButton()) return;

		if(interaction.customId === "attending_event"){
			const message = interaction.message
			const embed = interaction.message.embeds[0]
			const fields = embed.fields
			await find_and_replace(message, embed, fields, "[✅] Attending:", interaction.user)
			return interaction.reply({ content: "You have been added too [✅] Attending", ephemeral: true })
		}
		if(interaction.customId === "maybe_attending_event"){
			const message = interaction.message
			const embed = interaction.message.embeds[0]
			const fields = embed.fields
			await find_and_replace(message, embed, fields, "[🤷‍♂️] Maybe:", interaction.user)
			return interaction.reply({ content: "You have been added too [🤷‍♂️] Maybe", ephemeral: true })
		}
		if(interaction.customId === "not_attending_event"){
			const message = interaction.message
			const embed = message.embeds[0]
			const fields = embed.fields
			await find_and_replace(message, embed, fields, "[❌] Not attending:", interaction.user)
			return interaction.reply({ content: "You have been added too [❌] Not attending", ephemeral: true })
		}

	}
};

