const sql = require('sql');

module.exports = (app) => {
	const models = {};
	sql.setDialect('mysql');

	const schema = {
		users: sql.define({
			schema: 'store-admin',
			name: 'users',
			columns: [
				'userIndex',
				'userPriv',
				'userType',
				'userEmail',
				'userFullname',
				'userCreated',
				'userPass',
			],
		}),
		sessions: sql.define({
			schema: 'store-admin',
			name: 'sessions',
			columns: [
				'sessionIndex',
				'userIndex',
				'sessionCreated',
				'sessionExpires',
				'accessToken',
			]
		}),
		products: sql.define({
			schema: 'store-admin',
			name: 'products',
			columns: [
				'productIndex',
				'productSKU',
				'productTitle',
				'productDescription',
				'productImageURL',
				'categoryIndex',
				'productCurrency',
				'productPrice',
				'productStockLevel',
				'productUpdated',
				'productHasExpiryDate',
				'productExpiryDate',
			]
		}),
		categories: sql.define({
			schema: 'store-admin',
			name: 'categories',
			columns: [
				'categoryIndex',
				'categoryName',
			]
		}),
	}

	models.users = require('./users')(app, schema);
	models.sessions = require('./sessions')(app, schema);
	models.products = require('./products')(app, schema);
	return models;
};
