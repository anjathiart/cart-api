const sql = require('sql');

module.exports = (app, schema) => {

	// helper function to build the matching intermediate query conditions for fetching products
	const buildFetchQueryFurther = (query, search, categoryIndex, priceFrom, priceTo, inStock) => {
			// filter according to inStock filter param
			if (inStock === true) {
				query = query.where(schema.products.productStockLevel.gt(0));
			} else if (inStock === false) {
				query = query.where(schema.products.productStockLevel.equals(0));
			}

			// filter according to categoryIndex
			if (categoryIndex !== undefined && categoryIndex > 0) {
				query = query.where(schema.products.categoryIndex.equals(categoryIndex));
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
		async fetch(page, limit, search, order, categoryIndex, priceFrom, priceTo, inStock) {
			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
					schema.categories.categoryIndex
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));

			query = buildFetchQueryFurther(query, search, categoryIndex, priceFrom, priceTo, inStock);

			query = query.order(schema.products.productPrice)

			// action pagination
			query = query.limit(limit).offset((page * limit) - limit).toQuery();
			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0] : [];

		},

		async fetchProductIndexArray(search, categoryIndex, priceFrom, priceTo, inStock) {
			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));

			query = buildFetchQueryFurther(query, search, categoryIndex, priceFrom, priceTo, inStock);
			query = query.toQuery();

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0] : [];
		},

		async addStock(productIndex, value) {
			const query = {
				text: `UPDATE \`store-admin\`.\`products\` SET \`productStockLevel\` = \`productStockLevel\` + ? WHERE \`productIndex\` = ?`,
				values: [value, productIndex]
			}
			const rows = await app.db.query(query.text, query.values);
			return rows[0].changedRows > 0;
		},

		async removeStock(productIndex, value) {
			const query = {
				text: `UPDATE \`store-admin\`.\`products\` SET \`productStockLevel\` = `,
				values: []
			}

			// add the condition to ensure stock level is maintained
			query.text += `IF(\`productStockLevel\` - ? >= 0, \`productStockLevel\` - ?, \`productStockLevel\`)`;
			// limit to productIndex
			query.text += `WHERE \`productIndex\` = ?`;
			query.values = [value, value, productIndex];

			const rows = await app.db.query(query.text, query.values);
			return rows[0].affectedRows > 0 ? rows[0].changedRows : false
		},

	}
	return model;
}
