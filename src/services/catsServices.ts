import { mysqlConnection, query } from "../database/dbConnection.js";

export const randomCatFact = async (): Promise<string | null> => {
    try {
        const rows  = await mysqlConnection.query("select * from cats");
        const data = rows[0] as {id: number, fact: string}[];
        
        if(data.length > 0)
            return  data[0].fact;
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }

}