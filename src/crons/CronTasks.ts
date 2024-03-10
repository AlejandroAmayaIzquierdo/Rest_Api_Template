import { SessionCron } from './Tasks/SessionCron.js';

const CRON_TASKS: { [id: string]: App.CronTask } = {
  SessionCron: new SessionCron(),
};

export default CRON_TASKS;
