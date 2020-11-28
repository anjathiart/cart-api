module.exports = (app) => {
	const controls = {};
	controls.access = require('./access')(app);
	return controls;
}