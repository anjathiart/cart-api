const sql = require('sql');

module.exports = (app, schema) => {
	const model = {
		async selectUserByEmail(userEmail) {
			// do an extra clean up of the userEmail
			const email = (userEmail.indexOf('@') > 0) ? userEmail.toLowerCase().trim() : null;
			// TODO: log something useful
			let query = schema.users.select(schema.users.star()).from(schema.users);
			if (email !== null) {
				query = query.where(sql.functions.LOWER(schema.users.userEmail).equals(email)).toQuery();
			} else {
				return {};
			}
			
			const rows = await app.db.query(query.text, query.values);
			return (rows[0].length === 1 ? rows[0][0] : {});
			
		},
		async select(userIndex) {
			// TODO: log something useful
			let query = schema.users.select(schema.users.star()).from(schema.users);
			if (userIndex !== null) {
				query = query.where((schema.users.userIndex).equals(userIndex)).toQuery();
			} else {
				return {};
			}
			
			const rows = await app.db.query(query.text, query.values);
			return (rows[0].length === 1 ? rows[0][0] : {});
			
		},
		async insert(fields) {
			fields.userCreated = Math.floor(new Date() / 1000);
			const query = schema.users.insert(fields).toQuery();
			const rows = await app.db.query(query.text, query.values);
			return rows[0].insertId > 0 ? rows[0].insertId : null;

		}
	}
	return model;
}
