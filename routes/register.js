
module.exports = (app, koaRouter) => {
	koaRouter.post('/api/v1/register', async (ctx, next) => {
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
		const result = await app.controls.register.register(ctx.request.body);
		if (result !== null && result > 0) ctx.body = { success: true, userIndex: result };
		ctx.status = 200;
	});

}