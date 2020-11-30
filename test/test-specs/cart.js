
const expect = require('chai').expect;

const productA = {
	productIndex: 20,
}

module.exports = (app, api) => {
	const { accessToken } = app.config.testUser;
	console.log({accessToken})

	describe('User interaction with open cart', () => {

		describe('Add an item to the cart with unknown quantity', () => {
			it('200', (done) => {
				api.post('/api/v1/cart/add')
					.set('Accept', 'application/json')
					.set('Bearer', accessToken)
					.send({
						productIndex: productA.productIndex,
					})
					.end((err, res) => {
						expect(res.status).equal(200)
						done();
					})
			})
		})

		/*describe('Register user where the user already exists', () => {
			it('Force Error 400', (done) => {
				api.post('/api/v1/access/register')
					.set('Accept', 'application/json')
					.send({
						userFullname,
						userEmail,
						userPass,
					})
					.end((err, res) => {
						expect(res.status).equal(400)
						done();
					})
			})
		})

		describe('Register user with missing body parameters', () => {
			it('Force Error 400', (done) => {
				api.post('/api/v1/access/register')
					.set('Accept', 'application/json')
					.send({
						userFullname,
						userPass,
					})
					.end((err, res) => {
						expect(res.status).equal(400)
						done();
					})
			})
		})

		describe('Register user with invalid email', () => {
			it('Force Error: 400', (done) => {
				api.post('/api/v1/access/register')
					.set('Accept', 'application/json')
					.send({
						userFullname,
						userEmail: userEmail.replace('@', ''),
						userPass,
					})
					.end((err, res) => {
						expect(res.status).equal(400)
						done();
					})
			})
		})

		describe('Authenticate / Login user', () => {
			it('200', (done) => {
				api.post('/api/v1/access/login')
					.set('Accept', 'application/json')
					.send({
						userEmail,
						userPass,
					})
					.end((err, res) => {
						app.config.testUser.accessToken = res.body.accessToken;
						expect(res.status).equal(200)
						done();
					})
			})
		})

		describe('Authenticate / Login user with incorrect password', () => {
			it('403', (done) => {
				api.post('/api/v1/access/login')
					.set('Accept', 'application/json')
					.send({
						userEmail,
						userPass: `${userPass}_bad`,
					})
					.end((err, res) => {
						expect(res.status).equal(403)
						done();
					})
			})
		}) */

	})
}