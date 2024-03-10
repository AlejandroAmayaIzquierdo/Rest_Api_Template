// import mysql as mysql1 from "mysql";
import mysql from 'mysql2/promise';
import { BD_DATABASE_NAME, DB_HOST, DB_PASS, DB_USER } from '../index.js';

const CONNECTION_LIMIT = 10;

export class Db {
  private static instance: Db;

  private poolConnection: mysql.Pool | null;

  private constructor() {
    this.poolConnection = mysql.createPool({
      connectionLimit: CONNECTION_LIMIT,
      host: DB_HOST ?? 'localhost',
      user: DB_USER ?? 'root',
      password: DB_PASS ?? '',
      database: BD_DATABASE_NAME ?? 'dbName',
    });
  }

  public static getInstance = (): Db => {
    if (!Db.instance) this.instance = new Db();
    return this.instance;
  };

  public isConnectionAlive = async (): Promise<boolean> => {
    try {
      const query = await this.poolConnection?.query('SELECT 1');
      return query?.[0] ? true : false;
    } catch (error) {
      // console.log(error);
      return false;
    }
  };

  public query = async (sql: string): Promise<unknown> => {
    try {
      const query = await this.poolConnection?.query(sql);
      return query?.[0];
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  public getPoolConnection = () => this.poolConnection;
}
