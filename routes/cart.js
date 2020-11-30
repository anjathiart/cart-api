module.exports = (app, koaRouter) => {

	koaRouter.post('/api/v1/cart/add', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Add a product to the cart',
			body: {
				productIndex: { required: true },
				quantity: { default: 1 },
			},
			scope: ['user']
		});
	}, async (ctx) => {
		const result = await app.controls.carts.addProducts(ctx.validInput, ctx.session.userIndex)
		if (result.hasOwnProperty('errors')) {
			ctx.status = result.status ? result.status : 400;
			ctx.body = {
				errors: result.errors,
			}
		} else {
			ctx.status = 200;
		}
	})
}