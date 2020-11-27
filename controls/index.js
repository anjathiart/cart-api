module.exports = (app) => {
	const controls = {};
	controls.register = require('./register')(app);
	return controls;
}