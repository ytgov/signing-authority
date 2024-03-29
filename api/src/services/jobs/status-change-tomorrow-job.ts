import { clone, reverse, sortBy } from "lodash";
import moment from "moment";
import { EmailService } from "../email-service";
import { setHistoricAuthorityStatus } from "../../data/models";
import { Storage } from "../../data";

export class StatusChangeTomorrowJob {
  readonly cronSchedule = "15 6 * * *";

  async runJob() {
    let startTime = new Date();
    console.log("## StatusChangeTomorrowJob starting at", new Date());

    let storage = new Storage();
    await storage.ensureConnected();
    const authorityService = storage.Authorities;

    // have activation and are not cancelled
    let auths = await authorityService.getAll({
      $and: [{ cancel_date: { $exists: false } }, { activation: { $exists: true } }],
    });

    let today = new Date();
    let tomorrow = moment(today).add(24, "hours").toDate();

    console.log("#   Comparison set to", today, tomorrow);
    console.log("#   ", auths.length, "Authorities");

    let emailService = new EmailService();

    for (let auth of auths) {
      let todayAuth = clone(auth);
      let tomorrowAuth = clone(auth);

      setHistoricAuthorityStatus(todayAuth, today);
      setHistoricAuthorityStatus(tomorrowAuth, tomorrow);

      // run at 6:00 and look for currently inactive/active that are inactive/active in 24 hours and

      if (todayAuth.status != tomorrowAuth.status) {
        if (todayAuth.status == "Active") {
          console.log("#  -- Cancelled tomorrow");
          await emailService.sendFormBScheduleInactive(
            auth,
            moment(new Date()).add(24, "hours").format("MMMM D, yyyy")
          );
        } else {
          console.log("#  -- Activated tomorrow");

          let expireDate = "until cancelled";
          let activeActivation = auth.activation?.filter((a) => a.current_status == "Active");
          let expires = reverse(sortBy(activeActivation?.map((a) => a.expire_date)));

          if (expires.length > 0 && expires[0]) {
            expireDate = `to ${moment(expires[0]).format("MMMM D, yyyy")}`;
          }

          await emailService.sendFormBScheduleActive(
            auth,
            moment(new Date()).add(24, "hours").format("MMMM D, yyyy"),
            expireDate
          );
        }
      }
    }

    // check for authorities that
    console.log("#  StatusChangeTomorrowJob Completed at", new Date(), moment(new Date()).from(startTime));
  }
}
