// socketEvents.js
import { Server } from 'socket.io';
import { onChatMessage } from '../controllers/chatController.js';


const handleSocketEvents = (io: Server) => {
    io.on('connection', async (socket) => {
        //TODO only do this on the controller
        // console.log(`User connected: ${socket.id}`);
        // const token = socket.request.headers.authorization;
        // if(!token) {socket.disconnect(true);return;}
        // const isValid = await auth.validateSession(token);
        // if(!isValid) {socket.disconnect(true);return;}

        // Handle custom events here
        socket.on('chatMessage', (args) => {onChatMessage(socket,args)});

        

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

export default handleSocketEvents;
