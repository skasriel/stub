import { Request, Response } from 'express';
import express from 'express';
import { Logger } from 'winston';
import { check, validationResult, Result, ValidationError } from 'express-validator';

import jsdom from 'jsdom';
import createDOMPurify from 'dompurify';
const { JSDOM } = jsdom;
const window = new JSDOM('').window as any;
const DOMPurify = createDOMPurify(window);

import { UserDocument } from '../controllers/UserModel';

export const loginURL = '/user/login';
export const successResponse = {result: 'ok'};

export abstract class XRoute {
	protected router = express.Router();
    protected logger: Logger;
    protected path : string;

    constructor(logger: Logger, path: string) {
        this.logger = logger;
        this.path = path;
        this.initializeRoutes();
    }
    protected abstract initializeRoutes() : void;

	public getRouter() {
		return this.router;
	}
	public getPath() {
		return this.path;
	}

	protected domPurify(dirty: string) : string {
		return DOMPurify.sanitize(dirty);
	}
	protected logError(err: Error, msg: string) {
		this.logger.error(`[ERROR] ${msg}. Internal error is ${err} - ${err.stack}`);
	}
	protected logWarning(err: Error, msg: string) {
		this.logger.warn(`[WARNING] ${msg}. Internal error is ${err} - ${err.stack}`);
	}

	protected getUser(req: Request) : UserDocument {
		return req.user as UserDocument;
	}
	protected getUserMongoID(req: Request) {
		const mongoUser = req.user as UserDocument;
		if (! mongoUser) return null; // visitor
		return mongoUser._id;
	}

	protected sendError(res: express.Response, error: string) {
		return res.status(422).json({ errors: [{message: error}] });
	}
	protected sendValidationErrors(res: express.Response, errors: Result<ValidationError>) {
		this.logger.warn(`[FORM VALIDATION ERROR]: ${JSON.stringify(errors)}`);
		return res.status(422).json({ errors: errors.array() });
	}

	protected sendSuccess(res: express.Response) {
		return res.status(200).json(successResponse);
	}


}