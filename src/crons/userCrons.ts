import cron from 'node-cron';
import { mysqlConnection } from '../database/dbConnection.js';
import { ResultSetHeader } from 'mysql2';


export const deleteInvalidSessions = cron.schedule('0 * * * *', async () => {
    console.log('Deleting session expired...');
    const resp = await mysqlConnection.query('DELETE FROM user_session WHERE active_expires < UNIX_TIMESTAMP() OR idle_expires < UNIX_TIMESTAMP();');
    const data = resp[0] as ResultSetHeader;
    console.log(`${data.affectedRows} rows affected`);
});