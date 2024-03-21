import { scheduleJob } from "node-schedule";

import { ActingApprovalReminderJob } from "./jobs/acting-approval-reminder-job";
import { StatusChangeTomorrowJob } from "./jobs/status-change-tomorrow-job";

export class SchedulerService {
  constructor() {
    console.log(`** Starting Scheduler`);

    const actingApprovalReminderJob = new ActingApprovalReminderJob();
    scheduleJob(actingApprovalReminderJob.cronSchedule, actingApprovalReminderJob.runJob);
    console.log("*** Scheduling ActingApprovalReminderJob", actingApprovalReminderJob.cronSchedule);

    const statusChangeTomorrowJob = new StatusChangeTomorrowJob();
    scheduleJob(statusChangeTomorrowJob.cronSchedule, statusChangeTomorrowJob.runJob);
    console.log("*** Scheduling StatusChangeTomorrowJob", statusChangeTomorrowJob.cronSchedule);
  }
}
