const sql = require('sql');

module.exports = (app, schema) => {

	// helper function to build the matching intermediate query conditions for fetching products
	const buildFetchQueryFurther = (query, search, category, priceFrom, priceTo, inStock) => {
			// filter according to inStock filter param
			if (inStock === true) {
				query = query.where(schema.products.productStockLevel.gt(0));
			} else if (inStock === false) {
				query = query.where(schema.products.productStockLevel.equals(0));
			}

			// filter according to category
			if (category !== undefined && category > 0) {
				query = query.where(schema.products.categoryIndex.equals(category));
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

			return query;
	};

	const model = {
		async fetch(page, limit, search, order, category, priceFrom, priceTo, inStock) {
			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
					schema.categories.categoryIndex
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));

			query = buildFetchQueryFurther(query, search, category, priceFrom, priceTo, inStock);

			// action pagination
			query = query.limit(limit).offset((page * limit) - limit).toQuery();
			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0] : [];

		},

		async fetchProductIndexArray(search, category, priceFrom, priceTo, inStock) {
			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));

			query = buildFetchQueryFurther(query, search, category, priceFrom, priceTo, inStock);
			query = query.toQuery();

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0] : [];
		},

		async getStockLevel(productIndex) {
			let query = schema.products
				.select(schema.products.productStockLevel).from(schema.products)
				.where(schema.products.productIndex.equals(productIndex)).toQuery()

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0][0].productStockLevel : null;
		},

		async adjustStockLevel(productIndex, adjustedValue) {

			const query = await schema.products.update({productStockLevel: adjustedValue })
				.where(schema.products.productIndex.equals(productIndex)).limit(1)
				.toQuery();
			const rows = await app.db.query(query.text, query.values);
			return (rows[0].affectedRows > 0);
		},

		async release(productIndex, quantity) {

			const stockLevel = await app.models.products.getStockLevel(productIndex);
			const query = await schema.products.update({productStockLevel: stockLevel + quantity})
				.where(schema.products.productIndex.equals(productIndex)).limit(1)
				.toQuery();
			const rows = await app.db.query(query.text, query.values);
			return (rows[0].affectedRows > 0);
		},

	}
	return model;
}
