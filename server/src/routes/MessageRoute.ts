import { Request, Response } from 'express';
import express from 'express';
import { Logger } from 'winston';

import connectEnsureLogin from 'connect-ensure-login';
import { XRoute, loginURL } from './XRoute'

import { Message, MessageType } from '../controllers/MessageModel';
import { Order, OrderDocument, OrderStatus } from '../controllers/OrderModel';
import { check, validationResult } from 'express-validator';

import { v4 } from 'uuid';

export class MessageRoute extends XRoute {
    constructor(logger: Logger) {
        super(logger, '/message');
    }

    protected initializeRoutes() {

		/**
		 * Send a message on an order - can be sent either by buyer or seller
         * Currently uses a "shared inbox" model, we create a single copy of the message
         * :messageType is the type of deliverable. Currently "message" | "work-submission"
		 */
        this.router.post('/send/:messageType/:orderID', [
            connectEnsureLogin.ensureLoggedIn(loginURL),
            check('message').isLength({ min: 20, max: 1000 }).withMessage('Message must be between 20 and 1000 characters'),
        ], async (req: Request, res: Response) => {
            const senderUsername = this.getUser(req).username;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                this.logger.warn(`POST  submitted with errors ${errors.array()}`);
                return this.sendValidationErrors(res, errors);
            }
            const message = this.domPurify(req.body.message);
            const files = req.body.files as string[];
            const messageType = req.params.messageType;
            const orderID = req.params.orderID;
            try {
                // Clunky that we need to find the order every time. Perhaps change the schema or save in session?
                const orderDoc = await Order.findOne({ orderID }).exec();
                if (orderDoc.buyerUsername!==senderUsername && orderDoc.sellerUsername!==senderUsername) {
                    // this could be a fraud attempt - someone trying to insert themselves into a conversation?
                    throw new Error(`Shouldn't happen: sender is ${senderUsername} but buyer is ${orderDoc.buyerUsername} and seller is ${orderDoc.sellerUsername}`);
                }
                if (messageType === MessageType.WorkSubmission &&
                    [OrderStatus.ReqSubmitted, OrderStatus.InProgress].includes(orderDoc.status)) {
                    // mark order as delivered
                    orderDoc.status = OrderStatus.DeliveredBySeller
                    orderDoc.sellerSubmittedWorkDate = new Date();
                    await orderDoc.save();
                }
                const messageIsFromSeller = (orderDoc.sellerUsername === senderUsername)
                const messageDoc = new Message({
                    orderRef: orderDoc._id,
                    messageIsFromSeller,
                    message,
                    files,
                    messageType,
                    sentAt: new Date(),
                });
                await messageDoc.save();
                return this.sendSuccess(res);
            } catch (err) {
                this.logError(err, `Error sending message for orderID ${orderID} from sender ${senderUsername}`);
                return this.sendError(res, 'Unable to send message');
            }

            /*
orderRef: string;
    sender: string;
    recipient: string; // should we support multiple recipients at some point?
    message: string;
    files: string[];
    sentAt: Date;            */
        });

    };
}
