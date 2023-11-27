// cronJobs.js
import cron,{ScheduledTask} from 'node-cron';

const cronJobs: ScheduledTask[] = [];

// Function to add cron jobs from other modules
export const addCronJob = (schedule: string, task: string | ((now: Date | "manual" | "init") => void)) => {
    const job = cron.schedule(schedule, task);
    cronJobs.push(job);
    return job;
};

export const addCron = (cron: ScheduledTask) => {
    cronJobs.push(cron);
    return cron;
};

// Export the list of cron jobs (optional)
export const getCronJobs = () => cronJobs;

// Start all cron jobs
export const startCronJobs = () => {
    cronJobs.forEach(job => job.start());
};
