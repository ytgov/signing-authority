import express, { Request, Response } from "express";
import { isArray, reverse, sortBy } from "lodash";
import { Authority, setAuthorityStatus } from "../data/models";
import { RequiresData } from "../middleware";
import { GenericService, VrooziService } from "../services";
import moment from "moment";

export const integrationRouter = express.Router();
integrationRouter.use(RequiresData);

integrationRouter.get("/authorities-for-user/:email", async (req: Request, res: Response) => {
  const { email } = req.params;

  let db = req.store.Authorities as GenericService<Authority>;

  let regex = RegExp(email, "i");

  let auths = await db.getAll({ "employee.email": { $regex: regex } });

  for (let auth of auths) {
    setAuthorityStatus(auth);
    delete auth.audit_lines;
    delete auth.form_a;
  }

  auths = auths.filter((a) => a.status == "Active");

  let results = new Array<any>();

  for (let auth of auths) {
    let modified_date = new Date();
    if (auth.activation) {
      let activations = auth.activation.map((a) => a.approve_user_date || new Date());
      activations = reverse(sortBy(activations));
      modified_date = activations[0];
    }

    let authority_lines = auth.authority_lines.filter((a) => !a.operational_restriction);
    results.push({ email: auth.employee.email, authority_lines, modified_date });
  }

  res.json({ data: results });
});

integrationRouter.get("/users", async (req: Request, res: Response) => {
  let serv = new VrooziService();

  let db = req.store.Authorities as GenericService<Authority>;
  let department_code = "01";
  let list = await db.getAll({ department_code: department_code });

  for (let item of list) {
    setAuthorityStatus(item);
  }

  list = list.filter((a) => a.status == "Active");

  let exportList = new Array<any>();

  // send updates hourly of changes that happened in the last 24 hours

  for (let item of list) {
    let minLimit = 1000.75;
    let accountList = [
      { department: "01", coding: "01110100208", description: "PROGRAM MATERIALS" },
      { department: "01", coding: "011101002111234", description: "PROGRAM MATERIALS" },
    ];

    exportList.push({
      email: item.employee.email.toLowerCase(),
      approver: "",
      department: item.department_code, // use the department from the FormB or first if multiple
      modified: new Date(), // send the Form B approve date - ISO-8601
      limit: minLimit,
      accounts: accountList,
    });
  }

  //let authTest = await serv.test();
  //console.log(authTest)

  console.log("EXPORT", exportList);

  //await serv.sendAuthorities(exportList);

  let userList = await serv.getUsers();

  console.log("USERS", userList);

  res.json({ data: exportList });
});

integrationRouter.post("/amf/delta", async (req: Request, res: Response) => {
  let payload = req.body.data || req.body;

  if (isArray(payload)) {
    console.log("INTEGRATION ACCEPT ARRAY ", payload);
    res.json({ data: `Received an array with ${payload.length} elements` });
  } else {
    console.log("INTEGRATION FAIL NON-ARRAY", payload);
    res.json({ data: `Received an unexpected format - expected JSON array` });
  }
});
