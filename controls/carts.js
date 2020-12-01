

module.exports = (app) => {
	const control = {

		async addProduct({ productIndex, quantity }, userIndex) {
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
			return { itemIndex: result };
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

		async editItems({ editItems }, userIndex) {

			let errors = [];
			let successMessages = [];
			
			for (let i = 0; i < editItems.length; i += 1) {
				const { itemIndex, quantity } = editItems[i];
				const item = await app.models.carts.getItemByIndex({ itemIndex, userIndex, cartStatus: 'pending'});
				if (item.hasOwnProperty('itemIndex')) {
					if (item.itemQuantity < quantity) {
						let result = false;
						// addQuantity = quantity - itemQuantity
						const quantityToBeAdded = quantity - item.itemQuantity;
						// check stock levels, update with new quantity release stock levels if fails

						const stockLevel = await app.models.products.getStockLevel(item.productIndex);
						if (stockLevel === null) {
							errors.push(`Item ${item.itemIndex} not found`);
						}
						if (stockLevel < quantityToBeAdded) {
							errors.push(`Not enough stock: item ${itemIndex} could not be updated`);
						} else {

							// adjust the stock level (i.e. 'reserve' the stock for the customer)
							// NOTE: this is optimistic and still needs to be optimised for edge cases;  consider moving this into model query
							const reserveResult = await app.models.products.adjustStockLevel(item.productIndex, stockLevel - quantityToBeAdded);
							if (!reserveResult) {
								errors.push(`Either the item with index ${itemIndex} does not exist, or there is not enough stock`)
							} else {
								result = await app.models.carts.updateItem(itemIndex, quantity);
							}

							if (result === false) {
								stockLevel = await app.models.products.getStockLevel(item.productIndex);
								await app.models.products.adjustStockLevel(item.productIndex, stockLevel + quantityToBeAdded);
								errors.push(`Item ${item.itemIndex}'s quantity could not be updated to ${quantity}`);
							} else {
								successMessages.push(`Item  ${itemIndex}'s quantity successfully updated to ${quantity}`);
							}
							
						}

					} else if (item.itemQuantity > quantity) {
						const removeQuantity = item.itemQuantity - quantity;
						result = await app.models.carts.updateItem(item.itemIndex, quantity);

						if (result === false) {
							errors.push(`Item  ${itemIndex}'s quantity could not be updated to ${quantity}`);
						} else {
							// return the stock removed
							stockLevel = await app.models.products.getStockLevel(item.productIndex);
							await app.models.products.adjustStockLevel(item.productIndex, stockLevel + removeQuantity);
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

			if (errors.length > 0) {
				returnObject.errors = errors;
			}
			if (successMessages.length > 0) {
				returnObject.successMessages = successMessages
			}
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
