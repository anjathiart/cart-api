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
			scope: ['user'],
		})
	}, async (ctx) => {
		if (ctx.session.scope === 'user' && ctx.session.hasOwnProperty('sessionIndex')) {
			const result = await app.models.sessions.terminate(ctx.session.sessionIndex);
			if (result == true) {
				ctx.status = 200;
				ctx.body = {
					success: true
				}
			} else {
				ctx.status = 500;
			}
		} else {
			ctx.status = 403;
		}
		

	});

	// test route to clear test user for testing
	// NOTE: move this to a different module
	koaRouter.post('/api/v1/access/clearTestUser', async (ctx, next) => {
		if (app.env === 'development') {
			const result = await app.models.users.clearTestUser(ctx.request.body.userEmail);
			ctx.status = 200;
		}
	});
}