const crypto = require('crypto');
const bcrypt = require('bcrypt');


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
			console.log(user)
			if (user.hasOwnProperty('userIndex')) {
				console.log('xxxx')
				if (await bcrypt.compare(userPass, user.userPass)) {
					console.log('dhd')
					const accessToken = crypto.randomBytes(32).toString('hex');
					const sessionExpires = Math.floor(new Date() / 1000) + app.config.accessExpire;

					const sessionIndex = await app.models.sessions.insert({
						userIndex: user.userIndex,
						accessToken,
						sessionExpires,
						sessionCreated: Math.round(Date.now() / 1000),
					});

					console.log(sessionIndex)

					if (sessionIndex && sessionIndex >= 0) {
						return {
							sessionIndex,
							accessToken,
							sessionExpires,
						}
					}
				} else {
					// app.throw(400, 'Incorrect email password');
				}
			}
			return null;
		}
	}
	return control;
}
