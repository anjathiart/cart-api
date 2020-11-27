const sql = require('sql');

module.exports = (app) => {
	const models = {};
	sql.setDialect('mysql');

	const schema = {
		users: sql.define({
			schema: 'store-admin',
			name: 'user',
			columns: [
				'userId',
				'userIndex',
				'userPriv',
				'userType',
				'userEmail',
				'userFullname',
				'userCreated',
				'userPass',
			],
		}),
	}

	models.users = require('./users')(app, schema);

	return models;
};
