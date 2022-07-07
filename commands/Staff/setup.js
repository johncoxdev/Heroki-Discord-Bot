const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const Userdb = require('../../databases/userdb.js');
const Serverdb = require('../../databases/serverdb.js');
var teammateRoleExist

module.exports = {
    category: 'Staff',
	data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Initial setup for the bot'),

    async execute(interaction) {

        // Check if user has admin perms to execute command.
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){
        return interaction.reply({ content: 'Invalid Permissions. (`ADMINISTRATOR`)', ephemeral: true });
        }

        // Attempts to find the server and role within the server.
        const serverExistdb = await Serverdb.Server.findOne({ where: { serverID: interaction.guild.id } });
        teammateRoleExist = await interaction.guild.roles.cache.find(role => role.name === "Mochi-Teammates");

        await interaction.guild.channels.chache
        const categoryExist = await interaction.guild.channels.cache.find(chn => chn.name === "SG Channels")
        const vcChannelExist = await interaction.guild.channels.cache.find(chn => chn.name === "SG Waiting Lobby")
        const textChannelExist = await interaction.guild.channels.cache.find(chn => chn.name === "sg-game-invites")

        //if everything is setup, ignore rest and move on.
        if (serverExistdb && teammateRoleExist && categoryExist && vcChannelExist && textChannelExist) return interaction.reply("[❌] Setup has already been done. Aborting...");

        //Check to see if server has been added to Database
        if (!serverExistdb){
            Serverdb.inputServerDatabase(interaction.guild.id);
            await interaction.guild.members.fetch();
            await interaction.guild.members.cache.forEach(member => Userdb.addMemberDatabase(member));
            interaction.channel.send("[✅] Added server & members to database.");
        }

        //If role doesn't exist, then create the role
        if (!teammateRoleExist) {
            await interaction.guild.roles.create({
                name: 'Mochi-Teammates',
                color: 'YELLOW',
                reason: 'Super Gamer Bot role',
                permissions: []
            }).catch(error => interaction.channel.send(`There was an error \`${error}\``));
            await interaction.channel.send("[✅] \"Mochi-Teammates\" role created.");
        }

        teammateRoleExist = await interaction.guild.roles.cache.find(role => role.name === "Mochi-Teammates");
        //Case 1: If category exist, but channel doesnt. Create channel and put in category.
        if (categoryExist && !vcChannelExist) {
            await createVoiceChannel(interaction)
            interaction.channel.send('[✅] Created channel, added to category.')

        //Case 2: If category doenst exist, and channel does. Create category, and then add channel to category. 
        }else if (!categoryExist && vcChannelExist){
            await createCategory(interaction)
            const recallCategory = await interaction.guild.channels.cache.find(chn => chn.name === "SG Channels")
            await setToCategory(vcChannelExist, recallCategory)
            interaction.channel.send('[✅] Created category, added existing channel to category.')

        //Case 3: If category && channel doenst exist, create both and put channel inside category.
        }else if (!categoryExist && !vcChannelExist){
            await createCategory(interaction)
            await createVoiceChannel(interaction)
            interaction.channel.send('[✅] Created voice channel, Waiting Lobby & SG Channels category.')
        }

        if(!textChannelExist){
            await createTextChannel(interaction)
            interaction.channel.send('[✅] Created text channel, SG Game Invites.')
        }else if (textChannelExist && !categoryExist){
            const recallCategory = await interaction.guild.channels.cache.find(chn => chn.name === "SG Channels")
            setToCategory(textChannelExist, recallCategory)
        }
        interaction.channel.send("You are free to move the channels created. If you delete any of the channels made just use /setup again!")
        await interaction.reply("**Starting Setup**")
    },
};

async function createCategory(interact){
    await interact.guild.channels.create('SG Channels', {
        type: 'GUILD_CATEGORY',
        permissionOverwrites: [
            {
                id: interact.guild.roles.everyone.id,
                deny: [Permissions.FLAGS.VIEW_CHANNEL]
            },
            {
                id: teammateRoleExist.id,
                deny: [Permissions.FLAGS.SPEAK],
                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT]
            }
        ]
    })
}

async function createTextChannel(interact){
    await interact.guild.channels.cache

    const sgCategory = await interact.guild.channels.cache.find(chn => chn.name === "SG Channels")

    const sgVoiceChannel = await interact.guild.channels.create('sg-game-invites', {
        type: 'GUILD_TEXT',
        permissionOverwrites: [
            {
                id: interact.guild.roles.everyone.id,
                deny: [Permissions.FLAGS.VIEW_CHANNEL]
            },
            {
                id: teammateRoleExist.id,
                deny: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.CREATE_PUBLIC_THREADS],
                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY]
            }
        ]
    })

    sgVoiceChannel.setParent(sgCategory.id)
}

async function createVoiceChannel(interact){
    await interact.guild.channels.cache

    const sgCategory = await interact.guild.channels.cache.find(chn => chn.name === "SG Channels")

    const sgVoiceChannel = await interact.guild.channels.create('SG Waiting Lobby', {
        type: 'GUILD_VOICE',
        permissionOverwrites: [
            {
                id: interact.guild.roles.everyone.id,
                deny: [Permissions.FLAGS.VIEW_CHANNEL]
            },
            {
                id: teammateRoleExist.id,
                deny: [Permissions.FLAGS.SPEAK, Permissions.FLAGS.STREAM],
                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT]
            }
        ]
    })

    sgVoiceChannel.setParent(sgCategory.id)
}

async function setToCategory(guildChannel, guildCategory){
    guildChannel.setParent(guildCategory.id)
}