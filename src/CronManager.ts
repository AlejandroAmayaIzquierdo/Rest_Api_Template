// cronJobs.js
import cron,{ScheduledTask} from 'node-cron';
import { Db } from './database/dbConnection.js';
import { SessionCron } from './crons/SessionCron.js';


const CRON_DB_NAME = "cron_tasks";

const CRON_TASKS: any = {
    'SessionCron': SessionCron
}

export class CronManager {
    private cronJobs: {id: number, job: ScheduledTask}[]= [];

    public constructor(){
        this.initializeJobs();
    }
    public initializeJobs = async() => {
        try {
            this.cronJobs = [];
            const crons = await Db.getInstance().query(`select * from ${CRON_DB_NAME}`) as App.DbCron[];
            crons.forEach(cronData => {
                this.handleJob(cronData);
            });

                
        } catch (error) {
            console.log(error);
        }

    }

    private handleJob = (cronData: App.DbCron) => {
        if(CRON_TASKS.hasOwnProperty(cronData.name)){
            const cronClass = new CRON_TASKS[cronData.name]() as App.CronTask;
            const job = this.addJob(cronData,cronData.schedule, async () => {
                //Start Cron

                //Start Cron
                await cronClass.handle();

                //End Cron
                const now = new Date();
                const formattedDate = now.toISOString().slice(0, 19).replace("T", " ");
                await Db.getInstance().query(`UPDATE ${CRON_DB_NAME} SET lastEnd = '${formattedDate}' WHERE id = ${cronData.id}`);
                //End Cron
            });
            if(cronData.is_active === 1)
                job.start();
        }
    }


    public addJob = (cronData: App.DbCron,schedule: string, task: string | ((now: Date | "manual" | "init") => void)) => {
        const job = cron.schedule(schedule, task);
        this.cronJobs.push({id: cronData.id, job});
        return job;
    }
    public getCronJobs = () => this.cronJobs;

    public startJobById = (id: number) => {
        this.cronJobs.find(e => e.id === id)?.job.start();
    }
}