const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Joi = require('joi');


module.exports = (app) => {
	const control = {
		async register({ userEmail, userFullname, userPass }) {
			// check that the user does not already exist
			const user = await app.models.users.selectUserByEmail(userEmail);
			if (user.hasOwnProperty('userIndex')) {
				app.throw(400, "User already exists on system");
			}
			// TODO: log useful info
			const fields = {
				userFullname,
				userEmail,
				userPass: bcrypt.hashSync(userPass, bcrypt.genSaltSync(10)),
			}
			const userIndex = await app.models.users.insert(fields);
			return userIndex;
		},

		// NOTE: this is very simple authentication
		async authenticate({ userEmail, userPass }) {
			app.log('AUTH', userEmail);

			const user = await app.models.users.selectUserByEmail(userEmail);
			if (user.hasOwnProperty('userIndex')) {
				if (await bcrypt.compare(userPass, user.userPass)) {
					const accessToken = crypto.randomBytes(32).toString('hex');
					const sessionExpires = Math.floor(new Date() / 1000) + app.config.accessExpire;

					const sessionIndex = await app.models.sessions.insert({
						userIndex: user.userIndex,
						accessToken,
						sessionExpires,
						sessionCreated: Math.round(Date.now() / 1000),
					});

					if (sessionIndex && sessionIndex >= 0) {
						return {
							sessionIndex,
							accessToken,
							sessionExpires,
						}
					}
				} else {
					return {
						errors: ['Incorrect email or password']
					}
				}
			}
			return null;
		},


		async authorize(accessToken) {
			app.log('AUTH', 'Determine authorized scope');

			// validate accessToken
			let validAccessToken = '';
			const { error, value } = Joi.string().trim().token().length(64).validate(accessToken);
			
			if (value) {
				validAccessToken = value;
				const session = await app.models.sessions.select(validAccessToken);
				if (session.sessionIndex && Math.round(Date.now() / 1000) < session.sessionExpires) {
					return {
						scope: 'user',
						userIndex: 0,
						userPriv: session.userPriv,
						userEmail: session.userEmail,
						sessionIndex: session.sessionIndex,
						accessToken,
					}
				}
			}
			return {
				scope: 'public',
				userIndex: 0,
				userPriv: 100,
				userEmail: '',
				sessionIndex: 0,
				accessToken,
			};
		},
	}
	return control;
}
