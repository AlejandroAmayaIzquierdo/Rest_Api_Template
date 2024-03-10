import Express, { Express as ExpressType } from 'express';
import { Server as ServerIO } from 'socket.io';
import cors from 'cors';
import logger from 'morgan';
import dotenv from 'dotenv';

import { createServer, Server as NodeServer } from 'node:http';

import { CronManager } from './crons/CronManager.js';
import { Db } from './database/dbConnection.js';
import { AuthManager } from './database/AuthManager.js';
import Routes from './routes/index.js';
import { SocketHandler } from './sockets/Sockets.js';
import fileUpload from 'express-fileupload';

dotenv.config();

const PORT = process.env.PORT ?? 3000;

export const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  BD_DATABASE_NAME,
  SECRET_CLIENT_ID,
  SECRET_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
} = process.env;

export class Application {
  private app: ExpressType;
  private server: NodeServer;

  public static io: ServerIO;

  public constructor() {
    this.app = Express();
    this.server = createServer(this.app);
    Application.io = new ServerIO(this.server, { cors: { origin: '*' } });

    this.InitializeApp();
    this.InitializeRoutes();
  }

  private InitializeApp = () => {
    this.app.disable('x-powered-by');
    this.app.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
      }),
    );
    this.app.use(logger('dev'));
    this.app.use(Express.json());
    this.app.use(fileUpload());
  };

  private InitializeRoutes = () => {
    this.app.use('/', Routes);
  };

  public handle = async () => {
    const isDbUp = await Db.getInstance().isConnectionAlive();

    if (!isDbUp) {
      console.log('Database connection failed');
      console.log('Trying to reconnect every 5 seconds...');
      setTimeout(() => this.handle(), 5000);
      return;
    }

    CronManager.getInstance();
    AuthManager.getInstance();

    SocketHandler.handleConnections(Application.io);

    this.server.listen(PORT, () => {
      console.log(`Server listening to ${PORT} port 🚀`);
    });
  };
}

const app = new Application();

app.handle();
