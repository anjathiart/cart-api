module.exports = (app, koaRouter) => {
	koaRouter.get('/api/v1/products', async (ctx, next) => {
		await app.check(ctx, next, {
			description: 'Get list of all products',
			query: {
				page: { default: 1 },
				pageLength: { default: 10 },
				search: { default: '' },
				order: { default: '' },
				filter: { default: '' },
			},
			scope: ['user'],
		});
	}, async (ctx) => {
		if (ctx.session.userPriv === 0) {
			ctx.status = 200;
			ctx.body = {
				msg: 'TODO -> retreive store products'
			}
		} else {
			ctx.status = 403;
		}
		
	});
}