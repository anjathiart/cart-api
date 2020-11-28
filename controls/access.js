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
		}
	}
	return control;
}