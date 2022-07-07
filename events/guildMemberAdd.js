const { User, addMemberDatabase } = require('../databases/userdb.js');

module.exports = {
	name: 'guildMemberAdd',
	async execute(member) {
		const foundUser = await User.findOne({ where: { userID: member.id}})

		if (foundUser) return;
		
		addMemberDatabase(member)
	},
};