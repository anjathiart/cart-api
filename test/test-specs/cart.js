
const expect = require('chai').expect;

const productA = {
	productIndex: 20,
}

module.exports = (app, api) => {
	let accessToken = '';
	const { userEmail, userPass } = app.config.testUser
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
						accessToken = res.body.accessToken;
						console.log(accessToken)
						expect(res.status).equal(200)
						done();
					})
			})
		})

		describe('Add an item to the cart with unknown quantity', () => {
			it('200', (done) => {
				api.post(`/api/v1/cart/${productA.productIndex}/add`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.send({
						productIndex: productA.productIndex,
					})
					.end((err, res) => {
						expect(res.status).equal(200)
						done();
					})
			})
		})

		describe('Add an item to the cart with too large a quantity', () => {
			it('400', (done) => {
				api.post(`/api/v1/cart/${productA.productIndex}/add?quantity=100000`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.end((err, res) => {
						expect(res.status).equal(400)
						done();
					})
			})
		})

		describe('Add an item to the cart for unauthorized user', () => {
			it('403', (done) => {
				api.post(`/api/v1/cart/${productA.productIndex}/add?quantity=1`)
					.set('Accept', 'application/json')
					.end((err, res) => {
						expect(res.status).equal(403)
						done();
					})
			})
		})

		describe('Add an item to the cart for an non-existant productIndex', () => {
			it('404', (done) => {
				api.post(`/api/v1/cart/50000000/add?quantity=1`)
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
				api.post(`/api/v1/cart/${productA.productIndex}/add?quantity=sdfasf`)
					.set('Accept', 'application/json')
					.set('Authorization', `bearer ${accessToken}`)
					.end((err, res) => {
						expect(res.status).equal(400)
						done();
					})
			})
		})

	})
}