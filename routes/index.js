
const validate = require('../validate/');

module.exports = (app, koaRouter) => {

	koaRouter.use('/api/', async (ctx, next) => {
		// authorize user if scope is not public
		let accessToken = '';
		if (ctx.headers.authorization) {
			accessToken = ctx.headers.authorization.substr(7);
		}

		// retrieve session if exists
		const result = await app.controls.access.authorize(accessToken);

		if (result.hasOwnProperty('sessionIndex') && result.scope) {
			ctx.session = result;
			await next();
		} else {
			app.log('ERR', 'Scope does not exist');
			ctx.status = 403;
		}
	});


	app.check = async (ctx, next, inputDefinitions) => {
		if (!inputDefinitions.scope.includes(ctx.session.scope)) {
			app.log('ERR', 'Scope does not allow access')
			ctx.status = 403;
		}

		// input validation
		let missingSchema = false;
		let errors = [];
		ctx.validInput = {};

		// validate request path params
		if (inputDefinitions.params) {
			const paramsValidate = validate(inputDefinitions.params, ctx.params);
			missingSchema = (missingSchema || paramsValidate.missingSchema);
			errors = [...errors, ...paramsValidate.errors];
			ctx.validInput = { ...ctx.validInput, ...paramsValidate.validInput };
		}

		// validate request body
		if (inputDefinitions.body) {
			const bodyValidate = validate(inputDefinitions.body, ctx.request.body);
			missingSchema = (missingSchema || bodyValidate.missingSchema);
			errors = [...errors, ...bodyValidate.errors];
			ctx.validInput = { ...ctx.validInput, ...bodyValidate.validInput };
		}

		// validate request query params
		if (inputDefinitions.query) {
			const queryValidate = validate(inputDefinitions.query, ctx.query);
			missingSchema = (missingSchema || queryValidate.missingSchema);
			errors = [...errors, ...queryValidate.errors];
			ctx.validInput = { ...ctx.validInput, ...queryValidate.validInput };
		}

		// check for validation joi-schema error (missing joi-definitions)
		if (missingSchema) {
			ctx.status = 500;
			app.log('ERR', 'Validation schema is missing an input definition');
		// check for input validation errors
		} else if (errors.length > 0) {
			ctx.status = 400;
			ctx.body = {
				errors: errors,
			};
		} else {
			await next();
		}
	};

	// include all route files
	require('./access')(app, koaRouter);
	require('./cart')(app, koaRouter);

}