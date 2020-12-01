module.exports = {
	development: {
		domain: '127.0.0.1',
		port: 8444,
		basePath: 'api/v1/',
		url: 'http://127.0.0.1:8444',
		accessExpire: 2592000,
		db: {
			engine: 'MySQL',
			host: '127.0.0.1',
			user: '%MYSQL_USER',
			pass: '%MYSQL_PASS%',
			port: 3306,
			name: 'store-admin',
			schema: {
				admin: 'store-admin',
			},
		},
		testUser: {
			userFullname: 'Test User',
			userEmail: 'user@test.com',
			userPass: 'password1234',
			accessToken: '',
		},
		 testProductA: {
			productIndex: '%PRODUCT_INDEX%',
			initialProductStockLevel: '%INITAL_PRODUCT_STOCK_LEVEL%',
			productPrice: '%PRODUCT_PRICE%',
		}
	},
	production: {
		domain: '',
		port: 7444,
		basePath: '',
		url: '',
		accessExpire: 2592000,
		db: {
			engine: 'MySQL',
			host: '127.0.0.1',
			user: '%MYSQL_USER',
			pass: '%MYSQL_PASS%',
			port: 3306,
			name: 'store-admin',
			schema: {
				admin: 'store-admin',
			},
		},
	},
};


