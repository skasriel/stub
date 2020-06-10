import express from 'express';
import {Logger} from 'winston';
import { check, validationResult } from 'express-validator';

/**
 * Routes to edit the current user and list / edit all users (only if current user is Admin)
 */
export class UsersRoute {
  private router = express.Router();
  private path = '/users';
  private logger : Logger;

  constructor(logger: Logger) {
    // this.controller = controller;
    this.logger = logger;
    this.initializeRoutes();
  }

  public getRouter() {
    return this.router;
  }

  public getPath() {
    return this.path;
  }

  private initializeRoutes() {

    if (true) { // Not implemented yet
      return;
    }

    /*this.router.get('/', [
      UserModel.list
    ]);

    this.router.post('/', [
      UserModel.insert
    ]);

    this.router.get('/users/:userId', [
      UserModel.getById
    ]);
    this.router.patch('/users/:userId', [
      UserModel.patchById
    ]);
    this.router.delete('/users/:userId', [
      UserModel.removeById
    ]);*/
  }
}
