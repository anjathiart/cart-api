

module.exports = (app) => {
	const control = {
		async fetch({ page, limit, search, order, categoryIndex, priceFrom, priceTo, inStock }, userType) {
			
			// non admin types cannot query for out of stock items
			if (userType !== 'admin') inStock = true;
			
			const productsIndexArray = await app.controls.products.fetchProductIndexArray(search, categoryIndex, priceFrom, priceTo, inStock);
			
			// calculate pagination parameters
			const numProducts = productsIndexArray.length;
			const mod = numProducts % limit;
			const pageCount = mod > 0 ? (numProducts - mod) / limit + 1 : numProducts / limit;

			// set maximum limit allowed and set the limit to max on page if on last page
			limit = limit < 1000 ? limit : 1000;
			if (mod > 0 && mod < limit && page === pageCount) limit = mod

			// Check that page requested is not out of range
			page = page <= pageCount ? page : pageCount;
			if (pageCount === 0) {
				return {
					page,
					pageCount,
					limit,
					search,
					data: []
				}
			}
			const products = await app.models.products.fetch(page, limit, search, order, categoryIndex, priceFrom, priceTo, inStock);
			let result = [];
			if (userType !== 'admin') {
				result = products.map(product => {
					product.productPrice = `${product.productPrice.toFixed(2)} ${product.productCurrency}`;
					const { productIndex, productTitle, productPrice, categoryName, categoryIndex, productDescription } = product;
					return {
						productIndex,
						productTitle,
						productPrice,
						productDescription,
						categoryName,
						categoryIndex
					}
				});
			} else {
				result = products.map(product => {
					product.productPrice = parseFloat(product.productPrice, 0).toFixed(2);
					return product;
				});
			}
			return {
				page,
				pageCount,
				limit,
				search,
				data: result
			}
		},
		async fetchProductIndexArray(search, categoryIndex, priceFrom, priceTo, inStock) {
			const productIndexArray = await app.models.products.fetchProductIndexArray(search, categoryIndex, priceFrom, priceTo, inStock);
			return productIndexArray;
		},

	}

	return control;
}
