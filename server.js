// npm modules
const Koa = require('koa');
const KoaRouter = require('@koa/router');
const KoaBody = require('koa-body');
const Mysql = require('mysql2/promise');
const pino = require('pino');

// Set up pretty pino logging
const log = pino({
	prettyPrint: {
		colorize: true,
		translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
		ignore: 'pid,hostname',
	}
})

// global app setup
const app = {
	name: 'Cart',
	path: __dirname,
	env: process.env.NODE_ENV || 'development',
	config: require('./cart-api.config')[process.env.NODE_ENV || 'development'],
	log: (who, msg) => log.info(`${who} | ${msg}`),
	debug: msg => {
		log.debug(`${app.name} | ${msg}`);
		log.info(`SYS | ${msg}`);
	},
	warn: msg => log.warn(`${app.name} | ${msg}`),
	error: msg => log.error(`${app.name} | ${msg}`),
	throw: (status, msg) => {
		const error = new Error(msg);
		error.status = status;
		error.expose = true;
		error.msg = msg;
		throw error;
	},
};

// MySQL pool
app.db = Mysql.createPool({
	host: app.config.db.host,
	user: app.config.db.user,
	password: app.config.db.pass,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

app.controls = require('./controls/index')(app);
app.models = require('./models/index')(app);

// Server startup message
app.log('SYS', `ENV : ${app.env}`);

// init
const koaApp = new Koa();
// koaApp.use(logger());

const koaRouter = new KoaRouter();

// logging & CORS middleWare
koaApp.use(async (ctx, next) => {
	const start = Date.now();

	// process downstream
	try {
		await next();
	} catch (err) {
		ctx.status = err.status || 500;
		app.error(`${ctx.status} --> ${err.message}`);
		ctx.body = err.message ? { errors: [err.message] } : null;
	}

	// Log request information
	const urlShort = (ctx.request.url.indexOf('?') >= 0) ? ctx.request.url.substr(0, ctx.request.url.indexOf('?')) : ctx.request.url;
	app.log('API', `${ctx.request.method} | ${ctx.response.status} | ${Date.now() - start}ms | ${urlShort}`);

});

// middleware NPM modules load
koaApp.use(KoaBody({
	formLimit: '48mb',
	jsonLimit: '48mb',
	textLimit: '48mb',
	multipart: true,
}));

koaApp.use(koaRouter.routes()).use(koaRouter.allowedMethods());

// Route to check that service is responsive
koaRouter.get(`/ping`, async (ctx) => {
	ctx.status=200;
})

// load API routes
require('./routes/index')(app, koaRouter);

// Catch any unmatched urls
koaApp.use((ctx) => {
	ctx.status = 405;
});

// start server
app.log('API', `Listening on *:${app.config.port}`);
koaApp.listen(app.config.port);
