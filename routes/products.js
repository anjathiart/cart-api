module.exports = (app, koaRouter) => {
	koaRouter.get('/api/v1/products', async (ctx, next) => {
		await app.check(ctx, next, {
			description: 'Get list of all products',
			query: {
				page: { default: 1 },
				limit: { default: 10 },
				search: { default: '' },
				order: { default: '' },
				category: { default: '' },
				priceFrom: { default: '' },
				priceTo: { default: '' },
				inStock: { default: '' },
			},
			scope: ['public'],
		});
	}, async (ctx) => {
		const result = await app.controls.products.fetch(ctx.validInput, ctx.session.userType);
		if (result) {
			ctx.status = 200;
			ctx.body = result;
		} else {
			ctx.status = 404;
			ctx.body = {
				errors: ['No products were found for this query'],
			};
		}
	});
}