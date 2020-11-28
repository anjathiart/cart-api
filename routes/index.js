

module.exports = (app, koaRouter) => {

	app.check = async (ctx, next, { body }) => {
		// TODO: add proper validation of body parameter
		ctx.valid = { ...ctx.request.body };
		await next();
	};

	// include all route files
	require('./access')(app, koaRouter);

}