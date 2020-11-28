module.exports = (app, koaRouter) => {
	koaRouter.get('/api/v1/cart', async (ctx, next) => {
		await app.check(ctx, next, {
			description: 'Register a new user',
			scope: ['user'],
		});
	}, async (ctx) => {
		if (ctx.session.userPriv === 0) {
			ctx.status = 200;
			ctx.body = {
				msg: 'TODO -> retreive cart for current user',			}
		} else {
			ctx.status = 403;
		}
		
	});
}