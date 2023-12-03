import { lucia,Auth } from "lucia";
import * as adapterMysql from "@lucia-auth/adapter-mysql";
const { mysql2 } = adapterMysql;
import { express } from "lucia/middleware";
import { Db } from "./dbConnection.js";


export class AuthManager {
  public static instance: AuthManager;

  private auth: Auth | null = null;

  private constructor(){
    const pool = Db.getInstance().getPoolConnection();
    if(!pool) return;
    this.auth = lucia({
      env: "DEV",
      adapter: mysql2(pool,{user: "users",key: "user_key",session: "user_session"}),
      middleware: express(),
      getUserAttributes: (data: Lucia.DatabaseUserAttributes) => {
        return {
          userName: data.userName
        };
      },
    });
  }

  public static getInstance = (): AuthManager => {
    if(!this.instance)
      this.instance = new AuthManager();
    return this.instance
  }

  public getAuth = () => this.auth;
}