

module.exports = (app) => {
	const control = {

		async addProducts({ productIndex, quantity }, userIndex) {

			// check available stock level
			const stockLevel = await app.models.products.getStockLevel(productIndex);
			if (stockLevel === null) {
				return {
					status: 404,
					errors: ['The item could not be found or does not exist']
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
					errors: ['Either the product does not exist, or it went out of stock']
				}
			};

			// Create a new cart item or add items 
			const item = await app.models.carts.getItemByIndex(productIndex, userIndex, { itemStatus: 'pending' });
			let result;
			if (item.hasOwnProperty('itemIndex') && item.itemIndex > 0) {
				result = await app.models.carts.updateItem(item.itemIndex, item.itemQuantity + quantity);
			} else {
				result = await app.models.carts.insertItem(productIndex, quantity, userIndex);
			}

			// re-adjust the stock level (i.e. 'reserve' the stock for the customer)
			// NOTE: this is optimistic and still needs to be optimised for edge cases; consider moving this into model query
			if (result === false) {
				stockLevel = await app.models.products.getStockLevel(productIndex);
				await app.models.products.adjustStockLevel(productIndex, stockLevel + quantity);
				return {
					errors: ['This request could not be processed']
				}
			}
			return result;
		}
	}
	return control;
}
