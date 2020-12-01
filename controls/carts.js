

module.exports = (app) => {
	const control = {

		async addProduct({ productIndex, quantity }, userIndex) {
			console.log({productIndex})
			// check available stock level
			const stockLevel = await app.models.products.getStockLevel(productIndex);
			if (stockLevel === null) {
				return {
					status: 404,
					errors: ['The product could not be found or does not exist']
				}
			}

			if (stockLevel < quantity) {
				return {
					errors: [`Not enough stock: there are ${stockLevel} items in stock at this moment`]
				}
			}

			// adjust the stock level (i.e. 'reserve' the stock for the customer)
			// NOTE: this is optimistic and still needs to be optimised for edge cases;  consider moving this into model query
			const reserveResult = await app.models.products.adjustStockLevel(productIndex, stockLevel - quantity);
			if (!reserveResult) {
				return {
					status: 500,
					errors: ['Either the product does not exist, or it went out of stock']
				}
			};

			// Create a new cart item or add items
			const item = await app.models.carts.getItemByProductIndex({productIndex, userIndex, cartStatus: 'pending' });
			let result;
			if (item.hasOwnProperty('itemIndex') && item.itemIndex > 0) {
				result = await app.models.carts.updateItem(item.itemIndex, item.itemQuantity + quantity);
			} else {
				result = await app.models.carts.insertItem(productIndex, quantity, userIndex);
			}

			// re-adjust the stock level (i.e. 'release' the stock)
			// NOTE: this is optimistic and still needs to be optimised for edge cases; consider moving this into model query
			if (result === false) {
				stockLevel = await app.models.products.getStockLevel(productIndex);
				await app.models.products.adjustStockLevel(productIndex, stockLevel + quantity);
				return {
					status: 500,
					errors: ['This request could not be processed']
				}
			}
			return { itemIndex: result };
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

			// process the request
			const result = await app.models.carts.updateItem(item.itemIndex, item.itemQuantity - quantity);

			if (result === false) {
				return {
					status: 500,
					errors: ['The request could not be processed']
				}
			} else {
				// return the stock removed
				stockLevel = await app.models.products.getStockLevel(productIndex);
				await app.models.products.adjustStockLevel(productIndex, stockLevel + quantity);

			}
			return result;
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
			} else {
				// return the stock removed
				stockLevel = await app.models.products.getStockLevel(item.productIndex);
				await app.models.products.adjustStockLevel(item.productIndex, stockLevel + item.itemQuantity);

			}
			return result;
		},

		async clearByUserIndex(userIndex) {
			// attemp to remove the product from the user's cart
			// const item = await app.models.carts.getItemByIndex({ userIndex, cartStatus: 'pending'});

			const result = await app.models.carts.clearByUserIndex({ userIndex, cartStatus: 'pending' });
			if (result === false) {
				return {
					status: 404,
					errors: ['No items to be cleared']
				}
			}
			return result;
		},


	}
	return control;
}
