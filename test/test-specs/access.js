
const expect = require('chai').expect;

module.exports = (app, api) => {
	const { userFullname, userEmail, userPass } = app.config.testUser;


	describe('Register user (customer) / Login / Logout', () => {

		describe('Register new user', () => {
			it('200', (done) => {
				api.post('/api/v1/access/register')
					.set('Accept', 'application/json')
					.send({
						userFullname,
						userEmail,
						userPass,
					})
					.end((err, res) => {
						expect(res.status).equal(200)
						done();
					})
			})
		})

		describe('Register user where the user already exists', () => {
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
	})
}