const sequelize = require('../databases/initdb.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('/help', { type: 'PLAYING' })
		sequelize.sync({ force: false })
		console.log("Database has been sync'd!")
	},
};