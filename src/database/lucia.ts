import { lucia } from "lucia";
import * as adapterMysql from "@lucia-auth/adapter-mysql";
const { mysql2 } = adapterMysql;
import { mysqlConnection } from "./dbConnection.js";
import { express } from "lucia/middleware";



const auth = lucia({
    env: "DEV",
    adapter: mysql2(mysqlConnection,{user: "users",key: "user_key",session: "user_session"}),
    middleware: express(),
    getUserAttributes: (data) => {
		return {
			userName: data.userName
		};
	}
});

export default auth;