import { EmailService } from "../email-service";
import moment from "moment";
import { Storage } from "../../data";

export class ActingApprovalReminderJob {
  readonly cronSchedule = "0 6 * * *";

  async runJob() {
    let startTime = new Date();
    console.log("## ActingApprovalReminderJob starting at", new Date());

    let storage = new Storage();
    await storage.ensureConnected();
    const authorityService = storage.Authorities;

    // have activation and are not cancelled
    let auths = await authorityService.getAll({
      $and: [{ cancel_date: { $exists: false } }, { activation: { $exists: true } }],
    });

    let emailService = new EmailService();

    for (let auth of auths) {
      if (auth.authority_type != "acting") continue;

      if (auth.activation && auth.activation.length > 0) {
        for (let a of auth.activation) {
          if (a.reject_user_date || a.approve_user_date) {
            continue;
          }

          let expire = a.expire_date ?? moment().add(10, "years").toDate();

          if (moment().isAfter(expire)) {
            continue;
          }

          let startsTomorrow = moment(a.date) < moment().add(24, "hours");

          if (startsTomorrow) {
            console.log("ACTIVATION ", startsTomorrow, a);
            emailService.sendFormBActingReminderNotice(
              auth,
              a.approve_user_email,
              moment(a.date).format("YYYY-MM-DD"),
              moment(a.expire_date).format("YYYY-MM-DD")
            );
          }
        }
      }
    }

    // check for authorities that
    console.log("#   ActingApprovalReminderJob Completed at", new Date(), moment(new Date()).from(startTime));
  }
}
