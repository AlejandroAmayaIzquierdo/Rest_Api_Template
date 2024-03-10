import { Server as ServerIO, Socket as socketIO } from 'socket.io';
import { RoomManager } from './RoomManager.js';
import { AuthManager } from '../database/AuthManager.js';

export class SocketHandler {
  public static handleConnections = (io: ServerIO) => {
    io.on('connection', async (socket) => {
      await this.handleAuth(socket);

      socket.on('joinRoom', async (data: Api.JoinRoomData) => {
        console.log(`User ${data.userId} joined room ${data.roomId}`);
        if (RoomManager.isUserOnAnyRoom(data.userId)) return;
        RoomManager.joinRoom(socket, data.roomId, {
          userId: data.userId,
          userName: data.userName,
          SocketId: socket.id,
        });
      });

      //TODO: Implement the rest of the socket events

      socket.on('disconnect', async (reason, desc) => {
        console.log('User Disconnected', reason, desc);

        const room = RoomManager.isSocketOnAnyRoom(socket.id);

        console.log('user Disconected is on this Room', room?.getID());

        if (!room) return;

        const user = room.getPlayers().find((e) => e.SocketId === socket.id);

        if (!user) return;

        room.leave(user);
      });
    });
  };

  private static handleAuth = async (socket: socketIO) => {
    const token = socket.request.headers.authorization;
    if (!token) {
      this.disconnectUser(socket);
      return;
    }

    const isValid = await AuthManager.getInstance()
      .getAuth()
      ?.validateSession(token);
    if (!isValid) this.disconnectUser(socket);
  };

  public static disconnectUser = (socket: socketIO) => {
    console.log('Disconnecting user!');
    socket.emit('error', { status: 0, message: 'Unauthorize user!' });
    socket.disconnect(true);
  };
}
