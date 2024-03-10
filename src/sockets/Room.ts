import { Db } from '../database/dbConnection.js';
import { Application } from '../index.js';
import { RoomManager } from './RoomManager.js';

export class Room {
  private id: string;

  private usersInfo: Api.User[] = [];

  private interval: NodeJS.Timeout | undefined;

  private isPrivate: boolean = false;

  private startedAt: string = '';

  public static readonly MAX_TIME_BY_ROOM: number = 1800; // 30 minutes
  public static readonly MAX_USER: number = 2;

  public constructor(
    roomID: string,
    players?: Api.User[],
    isPrivate?: boolean,
  ) {
    this.id = `${roomID}`;

    if (players) this.usersInfo = [...this.usersInfo, ...players];

    this.isPrivate = isPrivate || false;
    this.startedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  public join = async (user: Api.User) => {
    let userInfo = user;
    const query = (await Db.getInstance().query(`
            SELECT id as userId,userName,profilePic,profileName 
            FROM users WHERE id='${user.userId}'`)) as Api.User[];
    if (query.length > 0) userInfo = query[0];
    const isUserOnRoom = this.usersInfo.find((e) => e.userId === user.userId);
    if (this.usersInfo.length < Room.MAX_USER && !isUserOnRoom)
      this.usersInfo.push(userInfo);
    Application.io.to(this.id).emit('joinedRoom', this.usersInfo);

    console.log('User joined', user.userId);

    if (!this.interval) this.handle();

    if (this.usersInfo.length === Room.MAX_USER) {
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
      await Db.getInstance().query(
        `UPDATE rooms SET users="${this.usersInfo
          .map((e) => e.userId)
          .join(',')}",isActive=1,startedAt="${formattedDate}" WHERE id='${
          this.id
        }'`,
      );
    }
  };

  public leave = async (user: Api.User) => {
    console.log('User left', user.userId);

    this.usersInfo = this.usersInfo.filter((e) => e.userId !== user.userId);
    Application.io.to(this.id).emit('leavedRoom', user);

    if (this.usersInfo.length <= 1) this.done();
  };

  public handle = () => {
    this.interval = setInterval(async () => {
      //TODO update data here
      // if (this.game.getGameData().started) this.game.update();

      if (this.isDone()) {
        //TODO condition to close room
        setTimeout(() => {
          this.done();
        }, 10000);
      }

      Application.io.to(this.id).emit('updateRoom', {
        // gameData: this.game.getGameData(),
        users: this.usersInfo,
        isPrivate: this.isPrivate,
      });
    }, 1000);
  };

  public isDone = () => {
    const now = new Date();
    const startDate = new Date(this.startedAt);
    const diff = now.getTime() - startDate.getTime();
    const seconds = diff / 1000;
    return seconds > Room.MAX_TIME_BY_ROOM;
  };

  public done = async () => {
    if (this.interval) clearInterval(this.interval);
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
    await Db.getInstance().query(
      `UPDATE rooms SET users="${this.usersInfo
        .map((e) => e.userId)
        .join(
          ',',
        )}",isActive=0,isEnded=1,endedAt="${formattedDate}" WHERE id="${
        this.id
      }"`,
    );
    RoomManager.removeRoom(this.id);
  };

  public static doesRoomShouldEnd = async (
    room: Api.Room,
  ): Promise<boolean> => {
    try {
      const { createdAt } = room;

      const now = new Date();
      const startDate = new Date(createdAt);
      const diff = now.getTime() - startDate.getTime();
      const seconds = diff / 1000;
      return seconds > Room.MAX_TIME_BY_ROOM;
    } catch (err) {
      return true;
    }
  };

  public getID = () => this.id;
  public getPlayers = () => this.usersInfo;
}
