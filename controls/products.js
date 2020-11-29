

module.exports = (app) => {
	const control = {
		async fetch({ page, pageLength, search, order, category, priceFrom, priceTo, inStock }) {
			const products = await app.models.products.fetch(page, pageLength, search, order, category, priceFrom, priceTo, inStock);

			const result = products.map(product => {
				const { productStockLevel, productHasExpiryDate, productExpiryDate, productUpdated, ...filteredProduct } = product;
				filteredProduct.productPrice = parseFloat(filteredProduct.productPrice);
				return filteredProduct;
			});

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
