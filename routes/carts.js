module.exports = (app, koaRouter) => {

	koaRouter.post('/api/v1/cart/product/:productIndex/add', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Add a product to the cart',
			params: {
				productIndex: { required: true },
			},
			body: {
				quantity: { default: 1 },
			},
			scope: ['user']
		});
	}, async (ctx) => {
		if (ctx.session.scope === 'user') {
			const result = await app.controls.carts.addProduct(ctx.validInput, ctx.session.userIndex)
			if (result.hasOwnProperty('errors')) {
				ctx.status = result.status ? result.status : 400;
				ctx.body = {
					errors: result.errors,
				}
			} else {
				ctx.status = 200;
				ctx.body = result;
			}
		} else {
			ctx.status = 403;
		}
	});

	koaRouter.post('/api/v1/cart/product/:productIndex/remove', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Remove a product from the user\'s cart',
			params: {
				productIndex: { required: true },
			},
			body: {
				quantity: { default: 1 },
			},
			scope: ['user']
		});
	}, async (ctx) => {
		if (ctx.session.scope === 'user') {
			const result = await app.controls.carts.removeProduct(ctx.validInput, ctx.session.userIndex)
			if (result.hasOwnProperty('errors')) {
				ctx.status = result.status ? result.status : 400;
				ctx.body = {
					errors: result.errors,
				}
			} else {
				ctx.status = 200;
				ctx.body = result;
			}
		} else {
			ctx.status = 403;
		}
	});

	koaRouter.post('/api/v1/cart/item/:itemIndex/delete', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Delete a line item from the cart',
			params: {
				itemIndex: { required: true },
			},
			scope: ['user']
		});
	}, async (ctx) => {
		if (ctx.session.scope === 'user') {
			const result = await app.controls.carts.deleteItem(ctx.validInput, ctx.session.userIndex)
			if (result.hasOwnProperty('errors')) {
				ctx.status = result.status ? result.status : 400;
				ctx.body = {
					errors: result.errors,
				}
			} else {
				ctx.status = 200;
				ctx.body = {
					success: true
				}
			}
		} else {
			ctx.status = 403;
		}
	});

	koaRouter.post('/api/v1/cart/clear', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Clear all items from the cart',
			scope: ['user']
		});
	}, async (ctx) => {
		if (ctx.session.scope === 'user') {
			const result = await app.controls.carts.clearByUserIndex(ctx.session.userIndex)
			if (result.hasOwnProperty('errors') && result.status !== 404) {
				// if no open cart items are found (404), then the status is still 200 in this case
				ctx.status = result.status === 404 ? 200 : 400;
				ctx.body = {
					errors: result.errors,
				}
			} else {
				ctx.status = 200;
				ctx.body = {
					success: true
				}
			}
		} else {
			ctx.status = 403;
		}
	});

	koaRouter.post('/api/v1/cart/edit', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Clear all items from the cart',
			body: {
				editItems: { required: true }
			},
			scope: ['user']
		});
	}, async (ctx) => {
		if (ctx.session.scope === 'user') {
			const result = await app.controls.carts.editItems(ctx.validInput, ctx.session.userIndex);
			ctx.body = result;
			if (result.hasOwnProperty('errors')) {
				ctx.status = result.hasOwnProperty('successMessages') ? 207 : 400;
			} else {
				ctx.status = 200;
			}
		} else {
			ctx.status = 403;
		}
	});

	koaRouter.get('/api/v1/cart/view', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Clear all items from the cart',
			scope: ['user']
		});
	}, async (ctx) => {
		if (ctx.session.scope === 'user') {
			const result = await app.controls.carts.fetchUserCart(ctx.session.userIndex);
			ctx.body = result;
			ctx.status = 200;
		} else {
			ctx.status = 403;
		}
	});

}