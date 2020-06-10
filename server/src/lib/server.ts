import dotenv from 'dotenv-flow';
dotenv.config();

// import createError from 'http-errors';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import lessMiddleware from 'less-middleware';
import morgan from 'morgan';
import passport from 'passport';
import { Logger } from 'winston';
import { Database } from './database';
import { setupLocalFunctions } from './locals';


const clientDirectory = path.join(__dirname, '../..');


export class Server {
	private app: express.Application;
	private logger: Logger;
	private server: http.Server;

	constructor(logger: Logger) {
		this.logger = logger;
		this.app = express();
		const app = this.app;

		// view engine setup
		logger.info(`client directory=${clientDirectory} based on dirname = ${__dirname}`);
		app.set('views', path.join(clientDirectory, 'views'));
		app.set('view engine', 'ejs');

		app.use(morgan('dev'));
		app.use(express.json());
		app.use(express.urlencoded({ extended: false }));
		app.use(cookieParser());


		// Session management. Here, using MongoDB because it's one less moving part to add.
		// Should consider using redis when necessary: https://www.npmjs.com/package/connect-redis
		const session = require('express-session');
		const MongoDBStore = require('connect-mongodb-session')(session);
		const store = new MongoDBStore({
			uri: Database.getMongoURI(this.logger),
			collection: 'sessions'
		}, (error: any) => {
			if (error) {
				this.logger.error(`Cannot initialize session store. Will abort. ${error}`);
				process.exit(1);
			}
		}
		);
		store.on('error', (error: any) => {
			this.logger.warn(`Session store error: ${error}`);
		});
		let cookieType = 'auto';
		if (app.get('env') === 'production') { // TODO: This is based on Express doc, but need to make sure it works
			app.set('trust proxy', 1) // trust first proxy
			cookieType = 'true' // serve secure cookies
		}

		const expressSession = require('express-session')({
			secret: process.env.EXPRESS_SESSION_SECRET,
			resave: false,
			saveUninitialized: false,
			cookie: { secure: cookieType },
			store,
		});


		app.use(expressSession);
		app.use(passport.initialize());
		app.use(passport.session());

		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));
		// app.use(lessMiddleware(path.join(clientDirectory, 'public'));
		app.use(express.static(path.join(clientDirectory, 'public')));

		app.use(setupLocalFunctions());

		// catch 404 and forward to error handler
		/*app.use((req, res, next) => {
		  next(createError(404));
		});

		// error handler
		app.use((err, req, res, next) => {
		  // set locals, only providing error in development
		  res.locals.message = err.message;
		  res.locals.error = req.app.get('env') === 'development' ? err : {};

		  // render the error page
		  res.status(err.status || 500);
		  res.render('error');
		});*/
	}

	/**
	* Add a router module to this app, at given path
	* @param {string} path Path to use for the route
	* @param {Express.Router} router Router module
	*/
	public addRouter(routerPath: string, router: express.Router) {
		this.app.use(routerPath, router);
	}

	/**
	* Add a middleware function to this app
	* @param {any} middleware
	*/
	public addMiddleware(middleware: any) {
		this.app.use(middleware);
	}

	/**
	* Start the server
	* @param {number} port Port on which the server will listen to
	*/
	public start(port: number) {
		this.server = this.app.listen(port, () => {
			this.logger.info(`Server listening on port: ${port}`);
		});
		return this.server;
	}

	public getApp() {
		return this.app;
	}
	public getServer() {
		return this.server;
	}
}
