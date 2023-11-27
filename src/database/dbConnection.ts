// import mysql as mysql1 from "mysql";
import mysql from "mysql2/promise";
import util from 'util';


export const mysqlConnection = mysql.createPool({
    connectionLimit : 10,
    host: "localhost",
    user: "root",
    database: "luciadb"
});

export const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);