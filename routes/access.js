module.exports = (app, koaRouter) => {
	koaRouter.post('/api/v1/access/register', async (ctx, next) => {
		await app.check(ctx, next, {
			description: 'Register a new user',
			body: {
				userFullname: { required: true },
				userEmail: { required: true },
				userPass: { required: true },
			},
			scope: ['public'],
		});

	}, async (ctx) => {
		const result = await app.controls.access.register(ctx.validInput);
		if (result !== null && result >= 0) ctx.body = { success: true, userIndex: result };
		ctx.status = 200;
	});

	koaRouter.post('/api/v1/access/login', async (ctx, next) => {
		await app.check(ctx, next, {
			description: 'Login existing user',
			body: {
				userEmail: { required: true },
				userPass: { required: true },
			},
			scope: ['public'],
		})
	}, async (ctx) => {
		const result = await app.controls.access.authenticate(ctx.validInput);
		if (result !== null && result.sessionIndex >= 0 && result.accessToken) {
			ctx.status = 200;
			ctx.body = result;
		} else if( result !== null && result.errors && result.errors.length > 0) {
			ctx.status = 400;
			ctx.body = {
				errors: result.errors,
			}
		} else {
			ctx.status = 403;
		}
	});

	koaRouter.post('/api/v1/access/logout', async (ctx, next) => {
		await app.check(ctx, next, {
			description: 'Logout current session',
			body: {
				sessionIndex: { required: true },
				accessToken: { required: true },
			},
			scope: ['user'],
		})
	}, async (ctx) => {
		

	})
}