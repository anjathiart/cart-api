

module.exports = (app) => {
	const control = {
		async fetch({ page, pageLength, search, order, category, priceFrom, priceTo, inStock }, userType) {
			const products = await app.models.products.fetch(page, pageLength, search, order, category, priceFrom, priceTo, inStock);

			let result = [];
			if (userType !== 'admin') {
				result = products.map(product => {
					product.productPrice = `${product.productPrice} ${product.productCurrency}`;
					return {
						productIndex,
						productTitle,
						productPrice,
						categoryName
					} = product;
				});
			} else {
				result = products.map(product => {
					product.productPrice = parseFloat(product.productPrice);
					return product;
				});
			}

			// TODO: renamve pageLength to pageLimit or limit
			return {
				page,
				pageLength,
				search,
				data: result
			}
		}

	}

	return control;
}
