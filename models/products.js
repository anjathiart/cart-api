const sql = require('sql');

module.exports = (app, schema) => {
	const model = {
		async fetch(page, limit, search, order, priceFrom, priceTo, inStock) {
			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));


			// action filter --> ['IN_STOCK', ...]
			if (inStock === true) {
				query = query.where(schema.products.productStockLevel.gt(0));
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

		async fetchProductIndexArray(limit, search, priceFrom, priceTo, inStock) {

			let query = schema.products
				.select(
					schema.products.productIndex,
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)))

			// filter according to inStock filter param
			if (inStock === true) {
				query = query.where(schema.products.productStockLevel.gt(0));
			} else if (inStock === false) {
				query = query.where(schema.products.productStockLevel.equals(0));
			}

			// filter according to price range
			if (priceFrom !== '' && priceTo !== '' && priceFrom < priceTo) {
				query = query.where(schema.products.productPrice.gte(priceFrom))
					.and(schema.products.productPrice.ste(priceTo))
			} else if (priceFrom !== '' && priceTo === '') {
				query = query.where(schema.products.productPrice.gte(priceFrom))
			} else if (priceFrom === '' && priceTo !== '') {
				query = query.where(schema.products.productPrice.lte(priceTo))
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
