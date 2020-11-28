const sql = require('sql');

module.exports = (app, schema) => {
	const model = {
		async insert(fields) {

			fields.sessionCreated = Math.floor(new Date() / 1000);
			const query = schema.sessions.insert(fields).toQuery();
			const rows = await app.db.query(query.text, query.values);
			return rows[0].insertId > 0 ? rows[0].insertId : null;
		},

		async select(accessToken) {
			// TODO: log something useful
			let query = schema.sessions
				.select(
					schema.sessions.star(),
					schema.users.userIndex,
					schema.users.userEmail,
					schema.users.userPriv,
				)
				.from(schema.sessions.join(schema.users).on(schema.users.userIndex.equals(schema.sessions.userIndex)))
				.where(schema.users.userPass.isNotNull())
				.where(schema.sessions.accessToken.equals(accessToken));

			query = query.toQuery();

			const rows = await app.db.query(query.text, query.values);
			if (rows[0].length === 1) {
				return {
					sessionIndex: rows[0][0].sessionIndex,
					sessionExpires: rows[0][0].sessionExpires,
					userIndex: rows[0][0].userIndex,
					userPriv: rows[0][0].userPriv,
					userEmail:rows[0][0].userEmail,
					accessToken,
				}
			} 
			return {};
			
		},
	}
	return model;
}