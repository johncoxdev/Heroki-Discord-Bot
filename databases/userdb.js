const Sequelize = require('sequelize');
const sequelize = require('./initdb.js');

const User = sequelize.define('userdb', {
    userID: {
        type: Sequelize.STRING,
        unique: true
    },
    userWinsRPS: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    userTotalRPSGames: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    userWinsTTT: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    userTotalTTTGames: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    userWinsCon4: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    userTotalCon4Games: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    userTotalWins: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    userTotalGames: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    userCommandBanned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    userWarnHistory: {
        type: Sequelize.JSON,
        defaultValue: {}
    },
    userTotalBumps: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    userCommandCooldown: {
        type: Sequelize.STRING,
        defaultValue: ""
    }
});

module.exports = {
    User,
    addMemberDatabase(discordMember) {
        User.create({
            userID: discordMember.id
        })
    }
};