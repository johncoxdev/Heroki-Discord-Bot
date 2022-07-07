const Sequelize = require('sequelize');
const sequelize = require('./initdb.js');

const Server = sequelize.define('serverdb', {
    serverID: {
        type: Sequelize.INTEGER,
        unique: true,
    },
    serverBoostChannelID: {
        type: Sequelize.STRING
    }
});
module.exports = {
    Server,
    inputServerDatabase(guildID){
		Server.create({
			serverID: guildID
		});
	}
}