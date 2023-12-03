import { Socket } from "socket.io";



export const onChatMessage = (socket: Socket,...args: any[]) => {
    const message = args[0];
    console.log(`Received chat message: ${message}`);

    socket.emit('chatMessage', message);
}