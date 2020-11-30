module.exports = (app) => {
	const controls = {};
	controls.access = require('./access')(app);
	controls.products = require('./products')(app);
	controls.carts = require('./carts')(app);
	return controls;
}