
const expect = require('chai').expect;

module.exports = (app, api) => {
	const productA = app.config.testProductA;
	const { userEmail, userPass } = app.config.testUser
	let accessToken = '';
	let cartItem = {};
	describe('User interaction with open cart', () => {

		describe('Authenticate / Login user', () => {
			it('200', (done) => {
				api.post('/api/v1/access/login')
					.set('Accept', 'application/json')
					.send({
						userEmail,
						userPass,
					})
					.end((err, res) => {
						expect(res.body).to.have.property('accessToken')
						accessToken = res.body.accessToken;
						expect(res.status).equal(200)
						done();
					})
			})
		})

		describe('Clear users cart', () => {
			it('200', (done) => {
				api.post('/api/v1/cart/clear')
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.end((err, res) => {
						expect(res.status).equal(200)

						done();
					})
			})
		})

		describe('Add a product to the cart with a set quantity', () => {
			it('200', (done) => {
				api.post(`/api/v1/cart/product/${productA.productIndex}/add`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.send({
						quantity: 2,
					})
					.end((err, res) => {
						expect(res.body).to.have.property('itemIndex')
						cartItem.itemIndex = res.body.itemIndex;
						cartItem.itemCount += 2
						expect(res.status).equal(200)
						done();
					})
			})
		})

		describe('Add a product to the cart with unknown quantity', () => {
			it('200', (done) => {
				api.post(`/api/v1/cart/product/${productA.productIndex}/add`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.end((err, res) => {
						expect(res.body).to.have.property('itemIndex')
						cartItem.itemIndex = res.body.itemIndex;
						cartItem.itemCount += 1
						expect(res.status).equal(200)
						done();
					})
			})
		})

		describe('Add a product to the cart with too large a quantity', () => {
			it('400', (done) => {
				api.post(`/api/v1/cart/product/${productA.productIndex}/add`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.send({
						quantity: productA.initialProductStockLevel + 1000,
					})
					.end((err, res) => {
						expect(res.status).equal(400)
						done();
					})
			})
		})

		describe('Add an item to the cart for unauthorized user', () => {
			it('403', (done) => {
				api.post(`/api/v1/cart/product/${productA.productIndex}/add`)
					.set('Accept', 'application/json')
					.send({
						quantity: 1,
					})
					.end((err, res) => {
						expect(res.status).equal(403)
						done();
					})
			})
		})

		describe('Add an item to the cart for an non-existant productIndex', () => {
			it('404', (done) => {
				api.post(`/api/v1/cart/product/50000000/add?`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.end((err, res) => {
						expect(res.status).equal(404)
						done();
					})
			})
		})

		describe('Add an item to the cart with query error', () => {
			it('400', (done) => {
				api.post(`/api/v1/cart/product/${productA.productIndex}/add`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.send({
						quantity: 'asfkfs',
					})
					.end((err, res) => {
						expect(res.status).equal(400)
						done();
					})
			})
		})

		describe('Edit an item in the cart', () => {
			it('200', (done) => {
				api.post(`/api/v1/cart/edit`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.send({
						editItems: [{ itemIndex: cartItem.itemIndex, quantity: 2 }],
					})
					.end((err, res) => {
						cartItem.itemCount = 2;
						expect(res.status).equal(200)
						done();
					})
			})
		})

		describe('Edit items in the cart with mulitple request status', () => {
			it('207', (done) => {
				api.post(`/api/v1/cart/edit`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.send({
						editItems: [
							{ itemIndex: cartItem.itemIndex, quantity: 3 },
							{ itemIndex: cartItem.itemIndex, quantity: productA.initialProductStockLevel + 1000 }
						],
					})
					.end((err, res) => {
						cartItem.itemCount = 3;
						expect(res.status).equal(207)
						done();
					})
			})
		})

		describe('View cart with correct line item count and price', () => {
			it('200', (done) => {
				api.get(`/api/v1/cart/view`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.end((err, res) => {
						expect(res.body).to.have.property('totalItemsCount')
						expect(res.body.totalItemsCount).to.equal(cartItem.itemCount)
						expect(res.body.totalPrice).to.equal(cartItem.itemCount * productA.productPrice)
						expect(res.status).equal(200)
						done();
					})
			})
		})

	})
}