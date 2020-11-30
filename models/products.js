const sql = require('sql');

module.exports = (app, schema) => {
	const model = {
		async fetch(page, limit, search, order, category, priceFrom, priceTo, inStock) {

			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));

			// filter according to inStock filter param
			if (inStock === true) {
				query = query.where(schema.products.productStockLevel.gt(0));
			} else if (inStock === false) {
				query = query.where(schema.products.productStockLevel.equals(0));
			}

			// filter according to price range
			if (priceFrom !== '' && priceTo !== '' && priceFrom < priceTo) {
				query = query.where(schema.products.productPrice.gte(parseFloat(priceFrom))
					.and(schema.products.productPrice.lte(priceTo)))
			} else if (priceFrom !== '' && priceTo === '') {
				query = query.where(schema.products.productPrice.gte(parseFloat(priceFrom)))
			} else if (priceFrom === '' && priceTo !== '') {
				query = query.where(schema.products.productPrice.lte(parseFloat(priceTo)))
			}

			// action search --> search description, title, and category
			if (search !== undefined && search.length > 0) {
				query = query.where(sql.functions.LOWER(schema.products.productTitle).like(`%${search.toLowerCase()}%`)
					.or(sql.functions.LOWER(schema.products.productDescription).like(`%${search.toLowerCase()}%`))
					.or(sql.functions.LOWER(schema.categories.categoryName).like(`%${search.toLowerCase()}%`)));
			}

			// action pagination
			query = query.limit(limit).offset((page * limit) - limit).toQuery();

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0] : [];

		},

		async fetchProductIndexArray(search, priceFrom, priceTo, inStock) {

			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));

			// filter according to inStock filter param
			if (inStock === true) {
				query = query.where(schema.products.productStockLevel.gt(0));
			} else if (inStock === false) {
				query = query.where(schema.products.productStockLevel.equals(0));
			}

			// filter according to price range
			if (priceFrom !== '' && priceTo !== '' && priceFrom < priceTo) {
				query = query.where(schema.products.productPrice.gte(parseFloat(priceFrom))
					.and(schema.products.productPrice.lte(priceTo)))
			} else if (priceFrom !== '' && priceTo === '') {
				query = query.where(schema.products.productPrice.gte(parseFloat(priceFrom)))
			} else if (priceFrom === '' && priceTo !== '') {
				query = query.where(schema.products.productPrice.lte(parseFloat(priceTo)))
			}

			// action search --> search description, title, and category
			if (search !== undefined && search.length > 0) {
				query = query.where(sql.functions.LOWER(schema.products.productTitle).like(`%${search.toLowerCase()}%`)
					.or(sql.functions.LOWER(schema.products.productDescription).like(`%${search.toLowerCase()}%`))
					.or(sql.functions.LOWER(schema.categories.categoryName).like(`%${search.toLowerCase()}%`)));
			}

			query = query.toQuery();

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0] : [];
		},


	}
	return model;
}
