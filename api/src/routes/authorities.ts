import express, { Request, Response } from "express";
import { Storage } from "../data";

import { uploadsRouter } from "./uploads"

import { body, param } from "express-validator";
import { RequiresData, ReturnValidationErrors } from "../middleware";
import { GenericService, UserService } from "../services";
import _ from "lodash";
import { EnsureAuthenticated } from "./auth";
import { Authority, Department, Employee } from "src/data/models";
import { Auth, ObjectId } from "mongodb";
import moment from "moment";
import { generatePDF } from "../utils/pdf-generator";

import { ExpressHandlebars } from "express-handlebars";

export const authoritiesRouter = express.Router();
// userRouter.use(RequiresData, EnsureAuthenticated);


import fs from "fs"
import path from "path"

authoritiesRouter.use('/uploads', uploadsRouter)

authoritiesRouter.get("/", async (req: Request, res: Response) => {
  let db = req.store.Authorities as GenericService<Authority>;
  let list = await db.getAll({})
  res.json({ data: list })
})

authoritiesRouter.get("/:id",
  [param("id").isMongoId().notEmpty()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let item = await loadSingleAuthority(req, id);

    if (item)
      return res.json({ data: item });

    res.status(404).send();
  });

authoritiesRouter.get("/:id/pdf",
  [param("id").isMongoId().notEmpty()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let item = await loadSingleAuthority(req, id);

    if (item) {
      const PDF_TEMPLATE = fs.readFileSync(__dirname + "/../templates/FormBTemplate.html")

      let t = new ExpressHandlebars();
      const template = t.handlebars.compile(PDF_TEMPLATE.toString(), {})
      let data = template(item);

      let pdf = await generatePDF(data)
      res.setHeader('Content-disposition', 'attachment; filename="FormB.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      res.send(pdf);
    }

    res.status(404).send();
  });

authoritiesRouter.put("/:id",
  [param("id").isMongoId().notEmpty()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let db = req.store.Authorities as GenericService<Authority>;

    if (req.body.department_id)
      req.body.department_id = new ObjectId(req.body.department_id);

    if (req.body.employee_id)
      req.body.employee_id = new ObjectId(req.body.employee_id);

    for (let line of req.body.authority_lines) {
      let account = `${line.account.replace(/[^0-9]/g, "")}*************************`;
      line.dept = account.substring(0, 2);
      line.vote = account.substring(2, 3);
      line.prog = account.substring(3, 5);
      line.activity = account.substring(5, 7);
      line.element = account.substring(7, 9);
      line.allotment = account.substring(9, 11);
      line.object = account.substring(9, 13);
      line.ledger1 = account.substring(13, 17);
      line.ledger2 = account.substring(17, 22);
      delete line.account;

      line.s24_procure_goods_limit = line.s24_procure_goods_limit === "0" ? "" : line.s24_procure_goods_limit;
      line.s24_procure_services_limit = line.s24_procure_services_limit === "0" ? "" : line.s24_procure_services_limit;
      line.s24_procure_request_limit = line.s24_procure_request_limit === "0" ? "" : line.s24_procure_request_limit;
      line.s24_procure_assignment_limit = line.s24_procure_assignment_limit === "0" ? "" : line.s24_procure_assignment_limit;
      line.s23_procure_goods_limit = line.s23_procure_goods_limit === "0" ? "" : line.s23_procure_goods_limit;
      line.s23_procure_services_limit = line.s23_procure_services_limit === "0" ? "" : line.s23_procure_services_limit;
      line.s24_transfer_limit = line.s24_transfer_limit === "0" ? "" : line.s24_transfer_limit;
      line.s23_transfer_limit = line.s23_transfer_limit === "0" ? "" : line.s23_transfer_limit;
      line.s24_travel_limit = line.s24_travel_limit === "0" ? "" : line.s24_travel_limit;
      line.other_limit = line.other_limit === "0" ? "" : line.other_limit;
      line.loans_limit = line.loans_limit === "0" ? "" : line.loans_limit;
      line.trust_limit = line.trust_limit === "0" ? "" : line.trust_limit;
      line.s29_performance_limit = line.s29_performance_limit === "0" ? "" : line.s29_performance_limit;
      line.s30_payment_limit = line.s30_payment_limit === "0" ? "" : line.s30_payment_limit;
    }

    await db.update(id, req.body);

    let item = await loadSingleAuthority(req, id);
    res.json({ data: item })
  });

authoritiesRouter.post("/",
  async (req: Request, res: Response) => {
    let db = req.store.Authorities as GenericService<Authority>;


    if (req.body.department_id)
      req.body.department_id = new ObjectId(req.body.department_id);

    if (req.body.employee_id)
      req.body.employee_id = new ObjectId(req.body.employee_id);

    let created = await db.create(req.body);
    let item = await loadSingleAuthority(req, created.insertedId.toString());
    res.json({ data: item })
  });




/* authoritiesRouter.post('/', async (req: Request, res: Response) => {
  //post object {user: "YNETUsername", account: "full-accuont-code"}
  //returns true and the value and type of approval
  return res.json({"TESTING": "crap"});
}); */

authoritiesRouter.get('/account/:account', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  return res.json({ "params": req.params });
});
authoritiesRouter.post('/account/:account', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  // -----------
  let a: any = req.store as Storage
  // await a.Authorities.create({"thing":"the other thing"})
  // -----------
  return res.json({});
});

authoritiesRouter.get('/:myAuthorities', async (req: Request, res: Response) => {
  //return a list of all the authorites assigned to my (YNET username)
  return res.json({ "params": req.params });
});

async function loadSingleAuthority(req: Request, id: string): Promise<any> {

  let db = req.store.Authorities as GenericService<Authority>;
  let depDb = req.store.Departments as GenericService<Department>;
  let empDb = req.store.Employees as GenericService<Employee>;
  let item = await db.getById(id);

  if (item) {
    item.department = await depDb.getOne({ _id: item.department_id });
    item.employee = await empDb.getOne({ _id: new ObjectId(item.employee_id) });

    if (item.issue_date)
      item.issue_date = moment(item.issue_date).utc(false).format("YYYY-MM-DD");

    for (let line of item.authority_lines) {
      line.account = `${line.dept}${line.vote}-${line.prog}${line.activity}${line.element}-${line.object}-${line.ledger1}-${line.ledger2}`;

      line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "")
      line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "")
      line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "")
      line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "")
      line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "")
      line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "")
      line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "")
      if (line.account.length < 26)
        line.account += "*";
    }

    return item;
  }

  return undefined;
}
