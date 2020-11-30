const expect = require('chai').expect;
const supertest = require('supertest');


// set globals & config parameters
const app = {};
app.name = 'CART API TESTS';
app.env = process.env.NODE_ENV || 'development';
app.config = require('../cart-api.config')[app.env];


console.log(`NODE_ENV: ${app.env}`);
console.log(app.config.url);

const api = supertest(app.config.url);

describe('Non existence route', () => {
	it('405', (done) => {
		api.get('/api/v1/fake')
		.end((err, res) => {
			expect(res.status).equal(405);
			done();
		});
	});
});

describe('Ping the server', () => {
	it('200', (done) => {
		api.get('/api/v1/ping')
		.end((err, res) => {
			expect(res.status).equal(200);
			done();
		});
	});
});

require('./test-specs/access.js')(app, api);
require('./test-specs/cart.js')(app, api);
