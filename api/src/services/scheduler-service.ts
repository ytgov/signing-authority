import { RecurrenceRule, scheduleJob } from "node-schedule";
import { Storage } from "../data";
import { clone } from "lodash";
import { setAuthorityStatus, setHistoricAuthorityStatus } from "../data/models";
import moment from "moment";

export class SchedulerService {
  // every minute - for testing purposes
  //readonly cronSchedule = "*/1 * * * *";

  // daily at 1:00am
  readonly cronSchedule = "0 1 * * *";

  constructor() {
    const schedule = new RecurrenceRule();
    schedule.minute;

    //let s = scheduleJob("*/5 12-18/1 * * *", this.runJob);
    scheduleJob(this.cronSchedule, this.runJob);
    console.log(`** Starting Scheduler to run at '${this.cronSchedule}'`);
  }

  async runJob() {
    let startTime = new Date();
    console.log("## Job starting at", new Date());

    let storage = new Storage();
    await storage.ensureConnected();
    const authorityService = storage.Authorities;

    // have activation and are not cancelled
    let auths = await authorityService.getAll({
      $and: [{ cancel_date: { $exists: false } }, { activation: { $exists: true } }],
    });

    let yesterday = moment().subtract(1, "day").toDate();

    console.log("#   ", auths.length, "Authorities");

    for (let auth of auths) {
      let yesterdayAuth = clone(auth);

      setAuthorityStatus(auth);
      setHistoricAuthorityStatus(yesterdayAuth, yesterday);

      if (auth.status != yesterdayAuth.status && (auth.status == "Active" || yesterdayAuth.status == "Active")) {
        console.log("#   Auth changed for:", auth.employee.email, auth.employee.title);
      }
    }

    // check for authorities that
    console.log("#   Job Completed at", new Date(), moment(new Date()).from(startTime));
  }
}
