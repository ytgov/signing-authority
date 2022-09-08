import express, { Request, Response } from "express";
import { Storage } from "../data";
import { uploadsRouter } from "./uploads";
import fs from "fs";
import { body, param } from "express-validator";
import { RequiresData, ReturnValidationErrors } from "../middleware";
import { GenericService, UserService } from "../services";
import _ from "lodash";
import { Authority, Department, Employee, Position } from "../data/models";
import { ObjectId } from "mongodb";
import moment from "moment";
import { generatePDF } from "../utils/pdf-generator";
import { FormatCoding } from "../utils/formatters";

import { ExpressHandlebars } from "express-handlebars";
import { checkJwt, loadUser } from "../middleware/authz.middleware";

export const authoritiesRouter = express.Router();



authoritiesRouter.use('/uploads', uploadsRouter);

authoritiesRouter.get("/", async (req: Request, res: Response) => {
  let db = req.store.Authorities as GenericService<Authority>;
  let list = await db.getAll({});
  res.json({ data: list });
});

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
      const PDF_TEMPLATE = fs.readFileSync(__dirname + "/../templates/FormBTemplate.html");

      let t = new ExpressHandlebars();
      const template = t.handlebars.compile(PDF_TEMPLATE.toString(), {});
      let data = template(item);

      let pdf = await generatePDF(data);
      res.setHeader('Content-disposition', 'attachment; filename="FormB.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      res.send(pdf);
    }

    res.status(404).send();
  });

authoritiesRouter.put("/:id", checkJwt, loadUser,
  [param("id").isMongoId().notEmpty()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let db = req.store.Authorities as GenericService<Authority>;

    if (req.body.department_id)
      req.body.department_id = new ObjectId(req.body.department_id);

    if (req.body.employee_id)
      req.body.employee_id = new ObjectId(req.body.employee_id);

    let existing = await db.getById(id);

    if (existing)
      delete existing.audit_lines;

    // If archiving a form note the details
    /*       if (req.query.archive == "true") {
            if (!req.body.deactivation)
              req.body.deactivation = {};
            req.body.deactivation.by = req.user.email;
            req.body.deactivation.sub = req.user.sub;
            req.body.deactivation.date = new (Date);
      
      
            req.body.audit_lines.push({
              date: new Date(),
              user_name: req.user.email,
              action: "Archived",
              previous_value: existing
            });
          } 
          else {*/
    req.body.audit_lines.push({
      date: new Date(),
      user_name: req.user.email,
      action: "Update",
      previous_value: existing
    });
    //}

    for (let line of req.body.authority_lines) {
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
    res.json({ data: item });
  });

authoritiesRouter.post("/", checkJwt, loadUser,
  async (req: Request, res: Response) => {
    let db = req.store.Authorities as GenericService<Authority>;

    req.body.audit_lines = [{
      date: new Date(),
      user_name: req.user.email,
      action: "Form B created"
    }];

    let created = await db.create(req.body);
    let item = await loadSingleAuthority(req, created.insertedId.toString());
    res.json({ data: item });
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
  let a: any = req.store as Storage;
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
  let formADb = req.store.FormA as GenericService<Position>;

  let item = await db.getById(id);

  if (item) {
    if (!item.audit_lines)
      item.audit_lines = [];

    for (let audit of item.audit_lines) {
      audit.date_display = moment(audit.date).format("YYYY-MM-DD @ h:mm a");
    }

    item.form_a = await formADb.getById(item.form_a_id.toString());

    if (item.activation && item.activation.length > 0) {
      let lastActiviation = item.activation[item.activation.length - 1];
      item.issue_date_display = moment(lastActiviation.date).format("YYYY-MM-DD");
    }
    for (let line of item.authority_lines) {
      line.coding_display = FormatCoding(line.coding);
    }

    return item;
  }

  return undefined;
}

// Department Specific FORM B Routes
authoritiesRouter.get("/department/:department", async (req: Request, res: Response) => {
  let db = req.store.Authorities as GenericService<Authority>;
  let department_code = req.params.department;
  let list = await db.getAll({ "department_code": department_code });

  if (list)
    return res.json({ data: list });
  res.status(404).send();
});