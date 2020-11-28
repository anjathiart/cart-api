const sql = require('sql');

module.exports = (app) => {
	const models = {};
	sql.setDialect('mysql');

	const schema = {
		users: sql.define({
			schema: 'store-admin',
			name: 'user',
			columns: [
				'userIndex',
				'userPriv',
				'userType',
				'userEmail',
				'userFullname',
				'userCreated',
				'userPass',
			],
		}),
		sessions: sql.define({
			schema: 'store-admin',
			name: 'session',
			columns: [
				'sessionIndex',
				'userIndex',
				'sessionCreated',
				'sessionExpires',
				'accessToken',
			]
		})
	}

	models.users = require('./users')(app, schema);
	models.sessions = require('./sessions')(app, schema);
	return models;
};
