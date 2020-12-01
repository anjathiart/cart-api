module.exports = (app, koaRouter) => {

	koaRouter.post('/api/v1/cart/:productIndex/add', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Add a product to the cart',
			params: {
				productIndex: { required: true },
			},
			query: {
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

	koaRouter.post('/api/v1/carts/:productIndex/remove', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Add a product to the user\'s cart',
			params: {
				productIndex: { required: true },
			},
			query: {
				quantity: { default: 1 },
			},
			scope: ['user']
		});
	}, async (ctx) => {
		console.log(ctx.session)
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

	koaRouter.post('/api/v1/carts/:itemIndex/delete', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Add a product to the cart',
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
				ctx.body = result
			}
		} else {
			ctx.status = 403;
		}
	});

	koaRouter.post('/api/v1/carts/clear', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Clear all items from the cart',
			scope: ['user']
		});
	}, async (ctx) => {
		if (ctx.session.scope === 'user') {
			const result = await app.controls.carts.clearByUserIndex(ctx.session.userIndex)
			if (result.hasOwnProperty('errors')) {
				ctx.status = result.status ? result.status : 400;
				ctx.body = {
					errors: result.errors,
				}
			} else {
				ctx.status = 200;
				ctx.body = result
			}
		} else {
			ctx.status = 403;
		}
	});

	koaRouter.post('/api/v1/carts/edit', async (ctx, next) => {
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

	koaRouter.post('/api/v1/carts/view', async (ctx, next) => {
		await app.check(ctx, next, { 
			description: 'Clear all items from the cart',
			body: {
				editItems: { required: true }
			},
			scope: ['user']
		});
	}, async (ctx) => {
		if (ctx.session.scope === 'user') {
			ctx.status = 200;
		} else {
			ctx.status = 403;
		}
	});

}