const sql = require('sql');

module.exports = (app, schema) => {

	const model = {
		async addProducts(productIndex, quantity, userIndex) {


			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));

			query = buildFetchQueryFurther(query, page, limit, search, order, category, priceFrom, priceTo, inStock);

			// action pagination
			query = query.limit(limit).offset((page * limit) - limit).toQuery();

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0] : [];

		},

		async getItemByIndex(productIndex, userIndex) {
			let query = schema.items.select(schema.items.star()).from(schema.items)
				.where(schema.items.cartStatus.equals('pending')
					.and(schema.items.userIndex.equals(userIndex))
					.and(schema.items.productIndex.equals(productIndex)))
				.limit(1).toQuery();

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0][0] : {};

		},

		async insertItem(productIndex, quantity, userIndex) {

			const fields = {
				productIndex,
				itemQuantity: quantity,
				userIndex,
				itemUpdated:  Math.floor(new Date() / 1000),
			}

			const query = schema.items.insert(fields).toQuery();
			const rows = await app.db.query(query.text, query.values);
			return (rows[0].insertId > 0);
		},

		async updateItem(itemIndex, quantity) {
			const query = schema.items.update({itemQuantity: quantity}).where(schema.items.itemIndex.equals(itemIndex)).limit(1).toQuery();
			const rows = await app.db.query(query.text, query.values);
			return (rows[0].affectedRows > 0);
		},

		async fetchProductIndexArray(search, priceFrom, priceTo, inStock) {
			let query = schema.products
				.select(
					schema.products.star(),
					schema.categories.categoryName,
				)
				.from(schema.products.join(schema.categories).on(schema.categories.categoryIndex.equals(schema.products.categoryIndex)));

			query = buildFetchQueryFurther(query, search, priceFrom, priceTo, inStock);
			query = query.toQuery();

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0] : [];
		},

	}
	return model;
}
