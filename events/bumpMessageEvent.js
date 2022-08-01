const { EmbedBuilder, Colors } = require('discord.js');
const { User } = require('../databases/userdb.js');

module.exports = {
	name: 'messageCreate',
	async execute(message) {
                if (message.author.username !== "DISBOARD") return;

                messageEmbed = message.embeds[0];
                embedDescription = messageEmbed.data.description;

                if (!embedDescription.includes("Bump done!")) return;

                const member = await message.interaction.user;
                const memberID = member.id

                const DbUser = await User.findOne({ where: { userID: memberID } });

                if (!DbUser) return message.channel.send({ content: `${member} cannot be found in the database. Tag the bot developer!`});

                await DbUser.increment(["userTotalBumps"]);

                bumpSuccess = new EmbedBuilder()
                        .setColor(Colors.DarkPurple)
                        .setThumbnail(member.displayAvatarURL())
                        .setDescription("Bump Success! **1+** point added to your profile!");

                message.channel.send({
                        embeds : [bumpSuccess]
                })


	},
};