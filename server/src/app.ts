import { logger } from './lib/logger';
import { Server } from './lib/server';
import { Database } from './lib/database';
import * as Routes from './routes';

// import debug from '@google-cloud/debug-agent';
// debug.start();

// @ts-ignore
import Config from "platformsh-config";
const config = Config.config();


export class Main {
    private server: Server;
    private db: Database;

    constructor() {
        this.server = new Server(logger);   // Create API server
        this.db = new Database(logger);
        const routes = [
            new Routes.BuyerHomeRoute(logger),
            new Routes.GalleryRoute(logger),
            new Routes.UserRoute(logger),
            new Routes.MessageRoute(logger),
            // new Routes.UsersRoute(logger),

            new Routes.BuyerGigRoute(logger),
            new Routes.CategoryRoute(logger),
            new Routes.CheckoutRoute(logger),
            new Routes.BuyerOrderRoute(logger),

            new Routes.SellerHomeRoute(logger),
            new Routes.SellerGigsRoute(logger),
            new Routes.NewGigRoute(logger),
            new Routes.SellerOrderRoute(logger),
        ];

        for (const route of routes) {
            this.server.addRouter(route.getPath(), route.getRouter());
        }
    }
    start() {
        let port: number;
        if (config.isValidPlatform() && !config.inBuild()) {
            port = config.port;
        } else {
            port = process.env.PORT ? Number(process.env.PORT) : 3000;
        }
        return this.server.start(port);
    }
    getApp() {
        return this.server.getApp();
    }
    getServer() {
        return this.server.getServer();
    }
    getLogger() {
        return logger;
    }
}

new Main().start();
