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
		console.log('trying to go to controls')
		console.log(ctx.validInput)
		const result = await app.controls.access.register(ctx.validInput);
		if (result !== null && result > 0) ctx.body = { success: true, userIndex: result };
		ctx.status = 200;
	});
}