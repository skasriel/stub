// import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import session from 'express-session';

import { Logger } from 'winston';
import { check, validationResult } from 'express-validator';
import passport from 'passport';
import { User, UserSchema } from '../controllers/UserModel';
import { XRoute, successResponse } from './XRoute';

// https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
import passportLocalMongoose from 'passport-local-mongoose';

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/**
 * Routes to register as a new user, login as an existing user
 */
export class UserRoute extends XRoute {
    constructor(logger: Logger) {
        super(logger, '/user');
    }

    protected initializeRoutes() {

        /**
         * Render Login Page
         */
        this.router.get('/login', (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const isLoggedIn = req.isAuthenticated && req.isAuthenticated();
			const user = req.user;
            res.render('login.ejs', {
                isLoggedIn,
                user,
                returnTo: (req.session ? req.session.returnTo : null)
            });
        });

        /**
         * Handles user login
         */
        this.router.post('/login', [
        ], (req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.logger.info(`Log in attempt with ${JSON.stringify(req.body)}`);
            req.body.username = req.body.username.toLowerCase();
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    this.logger.info(`Unable to find user in database 1 ${JSON.stringify(info)}`);
                    return this.sendError(res, err.message);
                    return next(err);
                }
                if (!user) {
                    this.logger.info(`Unable to find user in database 2 ${JSON.stringify(info)}`);
                    return this.sendError(res, 'Incorrect username/email or password');
                }
                req.logIn(user, (err2) => {
                    if (err2) {
                        this.logger.warn(`Unable to log in: ${err2}`);
                        return this.sendError(res, `Unable to log in, please try again`);
                    }
                    this.logger.info('Success logging in');
                    return this.sendSuccess(res);
                });
            })(req, res, next);
        });

        /**
         * Renders full signup page (as opposed to the modals which are included in partial views)
         */
        this.router.get('/signup', (req, res) => {
            const isLoggedIn = req.isAuthenticated && req.isAuthenticated();
			const user = req.user;
            res.render('signup.ejs', {
                isLoggedIn,
                user,
                returnTo: (req.session ? req.session.returnTo : null)
            });
        });

        /**
         * Handles sign up
         */
        this.router.post('/signup', [
            //check('firstName').trim().isLength({ min: 1, max: 100 }),
            //check('lastName').trim().isLength({ min: 1, max: 100 }),
            check('email').trim().isEmail(),
            check('username').trim().isLength({min: 5, max: 50}),
            check('password').isLength({ min: 6, max: 100 })
        ], (req: express.Request, res: express.Response, next: express.NextFunction) => {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                this.logger.warn(`POST submitted with errors ${JSON.stringify(errors.array())} for ${JSON.stringify(req.body)}`);
                return this.sendValidationErrors(res, errors);
            }

            let {
                firstName,
                lastName,
                username,
                email,
                password
            } = req.body;

            username = username.toLowerCase();
            email = email.toLowerCase();

            const newUser = new User({
                firstName,
                lastName,
                username,
                email
            });
            User.register(newUser, password, (err, createdUser) => {
                if (err) {
                    if (err.toString().includes("UserExistsError")) { // HACK: there has to be a better way to do this
                        this.logger.info("User already has an account, error: " + err);
                        return this.sendError(res, 'An account with this email address or username already exists');
                    }
                    this.logger.error("New account could not be saved. Error: " + err);
                    return this.sendError(res, `Unable to signup, please try again later`);
                }
                this.logger.info(`Successfully created user ${createdUser._id}`)
                // now create the auth tokens
                req.logIn(createdUser, (err2) => {
                    if (err2) {
                        this.logger.error('Unable to log in');
                        return this.sendError(res, `Unable to log in, please try again later`);
                    }
                    this.logger.info('Success logging in');
                    return this.sendSuccess(res);
                });
            });
        });

        /**
         * Yep, log out...
         */
        this.router.get('/logout', (req, res) => {
            req.logout();
            return res.redirect('/');
            /*const returnURL = req.query.return as string;
            if (returnURL) {
                res.redirect(returnURL);
            } else {
                res.redirect('/');
            }*/
        });

        // TODO: change and reset password - both come from passport-local-mongoose
        // TODO:  user.setPassword(req.body.password, function(err, user){ ..
        // TODO:  user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) ...

    }
}