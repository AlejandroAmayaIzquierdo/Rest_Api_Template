import Express from "express";
import cors from "cors";
import logger from "morgan";


// import { Server } from 'socket.io';
import { createServer } from 'node:http';
import v1Routes from "./routes/v1/index.js";
import userRoute from "./routes/user/user.js";
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { CronManager } from "./CronManager.js";


dotenv.config();

export const {DB_HOST,DB_USER,DB_PASS,BD_DATABASE_NAME} = process.env;

const app = Express();
app.disable('x-powered-by');

const server = createServer(app);
const io = new Server(server, {cors: {origin: "*"}});

app.use(cors());
app.use(logger('dev'));
app.use(Express.json());

app.use('/v1',v1Routes);

app.use('/user',userRoute);

const PORT = process.env.PORT ?? 3000;

//TODO cron jobs

const crons = new CronManager();

// Db.getInstance().query("select * from cats");

// handleSocketEvents(io);


server.listen(PORT,() => {
    console.log(`Server listening to ${PORT} port 🚀`);
})