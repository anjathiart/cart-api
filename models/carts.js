const sql = require('sql');

module.exports = (app, schema) => {

	const model = {

		async getItemByProductIndex({ productIndex, userIndex, cartStatus }) {
			let query = schema.items.select(schema.items.star()).from(schema.items)
				.where(schema.items.cartStatus.equals(cartStatus)
					.and(schema.items.userIndex.equals(userIndex))
					.and(schema.items.productIndex.equals(productIndex)))
				.limit(1).toQuery();

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0][0] : {};

		},

		async getItemByIndex({ itemIndex, userIndex, cartStatus }) {
			let query = schema.items.select(schema.items.star()).from(schema.items)
				.where(schema.items.cartStatus.equals('pending')
					.and(schema.items.userIndex.equals(userIndex))
					.and(schema.items.itemIndex.equals(itemIndex)))
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
			return rows[0].affectedRows > 0 ? rows[0].insertId : '';
		},

		async deleteItem(itemIndex) {
			const query = schema.items.delete({itemIndex}).where(schema.items.itemIndex.equals(itemIndex)).limit(1).toQuery();
			const rows = await app.db.query(query.text, query.values);
			return (rows[0].affectedRows > 0);
		},

		async increaseItemQuantity(itemIndex, quantity) {
			const query = {
				text: `UPDATE \`store-admin\`.\`items\` SET \`itemQuantity\` = \`itemQuantity\` + ? WHERE \`itemIndex\` = ?`,
				values: [quantity, itemIndex]
			}

			const rows = await app.db.query(query.text, query.values);
			return (rows[0].affectedRows > 0 && rows[0].changedRows > 0) ? true : false;
		},

		async reduceItemQuantity(itemIndex, quantity) {
			const query = {
				text: `UPDATE \`store-admin\`.\`items\` SET \`itemQuantity\` = `,
				values: []
			}
			// add condition to check that there is enough of this item in the cart
			query.text += `IF(\`itemQuantity\` - ? >= 0, \`itemQuantity\` - ?, \`itemQuantity\`)`;
			// limit to itemIndex
			query.text += `WHERE \`itemIndex\` = ?`;
			query.values = [quantity, quantity, itemIndex];

			const rows = await app.db.query(query.text, query.values);
			return rows[0].affectedRows > 0 && rows[0].changedRows > 0 ? true : false;
		},


		async clearByUserIndex({ userIndex, cartStatus }) {
			const query = schema.items.delete()
				.where(schema.items.userIndex.equals(userIndex))
				.where(schema.items.cartStatus.equals(cartStatus))
				.toQuery();
			const rows = await app.db.query(query.text, query.values);
			return (rows[0].affectedRows > 0);
		},

		async fetchUserCart({ userIndex, cartStatus }) {
			console.log({userIndex})
			let query = schema.items.
				select(
					schema.items.star(),
					schema.products.star()
				)
				.from(schema.items.join(schema.products).on(schema.items.productIndex.equals(schema.products.productIndex)));

				query = query.where(schema.items.userIndex.equals(userIndex))
					.where(schema.items.cartStatus.equals(cartStatus)).toQuery();
				

			const rows = await app.db.query(query.text, query.values);
			return rows[0].length > 0 ? rows[0]: [];
				
		}

	}

	return model;
}
