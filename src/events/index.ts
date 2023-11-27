// socketEvents.js
import { Server } from 'socket.io';
import auth from '../database/lucia.js';


const handleSocketEvents = (io: Server) => {
    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.id}`);
        const token = socket.request.headers.authorization;
        if(!token) {socket.disconnect(true);return;}
        const isValid = await auth.validateSession(token);
        if(!isValid) {socket.disconnect(true);return;}

        // Handle custom events here
        socket.on('chatMessage', (message) => {
            // Do something with the chat message
            console.log(`Received chat message: ${message}`);
            // You can broadcast the message to other clients, save it to a database, etc.
            message.emit('chatMessage', message);
        });

        // Add more event handlers as needed

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

export default handleSocketEvents;
