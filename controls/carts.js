

module.exports = (app) => {
	const control = {

		async addProduct({ productIndex, quantity }, userIndex) {

			// attempt to 'reserve' the quantity requested
			const reserveResult = await app.models.products.removeStock(productIndex, quantity)
			if (reserveResult === false) {
				return {
					status: 404,
					errors: [`Could not find product ${productIndex}`]
				}
			} else if (reserveResult === 0) {
				return {
					status: 400,
					errors: [`Not enough stock of this product`]
				}
			}

			// Create a new cart item or add items
			const item = await app.models.carts.getItemByProductIndex({productIndex, userIndex, cartStatus: 'pending' });
			let itemIndex = '';
			if (item.hasOwnProperty('itemIndex') && item.itemIndex > 0) {
				await app.models.carts.increaseItemQuantity(item.itemIndex, quantity)
				.then(res => {
					if(res) itemIndex = item.itemIndex;
				});
			} else {
				itemIndex = await app.models.carts.insertItem(productIndex, quantity, userIndex);
			}

			// re-adjust the stock level (i.e. 'release' the stock)
			if (!itemIndex) {
				await app.models.products.addStock(productIndex, quantity)
				return {
					status: 500,
					errors: ['This request could not be processed']
				}
			}

			return { itemIndex };
		},


		async removeProduct({ productIndex, quantity }, userIndex) {
			// attemp to remove the product from the user's cart
			const item = await app.models.carts.getItemByProductIndex({ productIndex, userIndex, cartStatus: 'pending' });
			
			// check that the item is in the cart and that it is possible to remove the desired quantity of the item
			if (!item.hasOwnProperty('itemIndex')) {
				return {
					status: 404,
					errors: [`The product could not be found in your cart`]
				}
			} else if (item.itemQuantity < quantity) {
				return {
					status: 400,
					errors: [`You only have ${item.Quantity} of this item in your cart.`]
				}
			}

			const result = await app.models.carts.reduceItemQuantity(item.itemIndex, quantity);

			if (result === false) {
				return {
					status: 500,
					errors: ['The request could not be processed']
				}
			} else {
				// return the stock removed
				await app.models.products.addStock(productIndex, quantity);
			}

			return { itemIndex: item.itemIndex };
		},



		async deleteItem({ itemIndex }, userIndex) {
			// attemp to remove the product from the user's cart
			const item = await app.models.carts.getItemByIndex({ itemIndex, userIndex, cartStatus: 'pending'});
			// check that the item is in the cart and that it is possible to remove the desired quantity of the item
			if (!item.hasOwnProperty('itemIndex')) {
				return {
					status: 404,
					errors: [`The line item could not be found in your cart`]
				}
			}

			// process the request
			const result = await app.models.carts.deleteItem(item.itemIndex);

			if (result === false) {
				return {
					status: 500,
					errors: ['The request could not be processed']
				}
			}
			// return the stock removed
			await app.models.products.addStock(item.productIndex, item.itemQuantity);

			return result;
		},

		async editItems({ editItems }, userIndex) {

			let errors = [];
			let successMessages = [];
			
			for (let i = 0; i < editItems.length; i += 1) {
				const { itemIndex, quantity } = editItems[i];
				const item = await app.models.carts.getItemByIndex({ itemIndex, userIndex, cartStatus: 'pending'});
				if (item.hasOwnProperty('itemIndex')) {
					if (item.itemQuantity < quantity) {
						let result = false;
						const quantityToBeAdded = quantity - item.itemQuantity;
						
						// attempt to 'reserve' the quantity requested
						const reserveResult = await app.models.products.removeStock(item.productIndex, quantityToBeAdded);

						if (reserveResult === false) {
							errors.push(`Could not find product ${item.productIndex}`);
						} else if (reserveResult === 0) {
							errors.push(`Not enough stock: item ${itemIndex} could not be updated`);
						} else {
							result = await app.models.carts.increaseItemQuantity(itemIndex, quantityToBeAdded);
							if (result === false) {
								await app.models.products.addStock(item.productIndex, quantityToBeAdded);
								errors.push(`Item ${item.itemIndex}'s quantity could not be updated to ${quantity}`);
							} else {
								successMessages.push(`Item  ${itemIndex}'s quantity successfully updated to ${quantity}`);
							}
						}

					} else if (item.itemQuantity > quantity) {
						const quantityToBeRemoved = item.itemQuantity - quantity;
						result = await app.models.carts.reduceItemQuantity(item.itemIndex, quantityToBeRemoved);

						if (result === false) {
							errors.push(`Item  ${itemIndex}'s quantity could not be updated to ${quantity}`);
						} else {
							// return the stock removed
							await app.models.products.addStock(item.productIndex, quantityToBeRemoved);
							successMessages.push(`Item ${itemIndex}'s quantity successfully updated to ${quantity}`);
						}
					} else {
						successMessages.push(`Item ${itemIndex}'s quantity successfully updated to ${quantity}`);
					}
				} else {
					errors.push(`Item ${itemIndex} not found`);
				}
			}

			const returnObject = {};
			if (errors.length > 0) returnObject.errors = errors;
			if (successMessages.length > 0) returnObject.successMessages = successMessages
			return returnObject;
		},

		async clearByUserIndex(userIndex) {
			
			const result = await app.models.carts.clearByUserIndex({ userIndex, cartStatus: 'pending' });
			if (result === false) {
				return {
					status: 404,
					errors: ['No items to be cleared']
				}
			}
			return result;
		},

		async fetchUserCart(userIndex) {
			const result = await app.models.carts.fetchUserCart({ userIndex, cartStatus: 'pending' });

			const cartItems = result.map(item => {
				const { itemIndex, itemQuantity, productIndex, productPrice, productCurrency, productTitle, productImageURL } = item;
				return {
					itemIndex,
					productTitle,
					productIndex,
					productImageURL,
					itemQuantity,
					currency: productCurrency,
					unitPrice: productPrice,
					itemTotalPrice: parseFloat((productPrice * itemQuantity).toFixed(2)),
				};
			})

			const cart = {
				userIndex: userIndex,
				totalItemsCount: cartItems.reduce((sum, currentItem) => {
					return sum + currentItem.itemQuantity;
				}, 0),
				totalPrice: cartItems.reduce((sum, currentItem) => {
					return sum + currentItem.itemTotalPrice;
				}, 0),
				timsestamp: Math.floor(new Date() / 1000),
				data: cartItems,
			}
			return cart;
		}
	}
	return control;
}
