const sql = require('sql');

module.exports = (app, schema) => {
	const model = {
		async fetch(page, pageLength, search, order, filter) {
			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));


			// action filter --> ['IN_STOCK', ...]
			if (filter === 'IN_STOCK') {
				query = query.where(schema.products.productStockLevel.gt(0));
			}

			// action search --> search description, title, and category
			if (search !== undefined && search.length > 0) {
				query = query.where(sql.functions.LOWER(schema.products.productTitle).like(`%${search.toLowerCase()}%`)
					.or(sql.functions.LOWER(schema.products.productDescription).like(`%${search.toLowerCase()}%`))
					.or(sql.functions.LOWER(schema.categories.categoryName).like(`%${search.toLowerCase()}%`)));
			}

			// action order
			query = query.toQuery();

			// action pagination

			const rows = await app.db.query(query.text, query.values);

			return rows[0].length > 0 ? rows[0] : [];

		}


	}
	return model;
}
