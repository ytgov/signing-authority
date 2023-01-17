import express, { Request, Response } from "express";
import { Authority, setAuthorityStatus } from "../data/models";
import { RequiresData } from "../middleware";
import { GenericService, VrooziService } from "../services";

export const integrationRouter = express.Router();
integrationRouter.use(RequiresData);

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
  //await serv.sendAuthorities(exportList);

  let userList = await serv.getUsers();

  console.log("USERS", userList)

  res.json({ data: userList });
});
