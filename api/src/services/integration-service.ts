import axios from "axios";
import https from "https";
import { INTEGRATION_ENDPOINT_URL } from "../config";
import { Authority, setAuthorityStatus, setHistoricAuthorityStatus } from "../data/models";
import moment from "moment";
import { cloneDeep } from "lodash";

export class IntegrationService {
  async checkAuthorityChange(baseAuthority: Authority): Promise<any> {
    let authority = cloneDeep(baseAuthority);
    let yesterdayAuthority = cloneDeep(baseAuthority);
    setHistoricAuthorityStatus(yesterdayAuthority, moment().subtract(1, "day").toDate());
    setAuthorityStatus(authority);

    let email = authority.employee.email;
    let currentStatus = authority.status;

    console.log("checkAuthorityChange", email, authority._id, currentStatus, yesterdayAuthority.status);

    // one must be active, but not both
    if (currentStatus == "Active" || yesterdayAuthority.status == "Active") {
      if (currentStatus != yesterdayAuthority.status) {
        this.notifyOfAuthorityChange(email);
      }
    }
  }

  async notifyOfAuthorityChange(email: string): Promise<any> {
    console.log("Sending Authority Change to Integration at " + `${INTEGRATION_ENDPOINT_URL}/${email}`);

    axios
      .get(`${INTEGRATION_ENDPOINT_URL}/authority-changed/${email}`, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      })
      .then((resp) => {
        console.log("Successfully received data: ", resp.data);
        return resp.data;
      })
      .catch((err) => {
        console.log("ERROR: notifyOfAuthorityChange", err.response?.status, err.response?.data);
        console.log("INTEGRATION ERROR:", err);
      });
  }
}
