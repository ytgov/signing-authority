import express, { Request, Response } from "express";
import { body, param } from "express-validator";

import moment from "moment";
import _ from "lodash";
import { uploadsRouter } from "./uploads";
import { generatePDF } from "../utils/pdf-generator";
import { ReturnValidationErrors } from "../middleware";
import { GenericService, QuestService, UserService } from "../services";

import { Authority, FormA, OperationalRestrictions } from "../data/models";
import { ObjectId } from "mongodb";

import { ExpressHandlebars } from "express-handlebars";
export const formARouter = express.Router();

import { checkJwt, loadUser } from "../middleware/authz.middleware";
import { FormatCoding } from "../utils/formatters";

// formARouter.use('/uploads', uploadsRouter)

const questService = new QuestService();

formARouter.get("/operational-restrictions", (req: Request, res: Response) => {
  return res.json(OperationalRestrictions);
});

formARouter.get("/", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let list = await db.getAll({});
  res.json({ data: list });
});

formARouter.get("/count", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let count = await db.count({});
  if (count)
    return res.json({ "form_a_count": count });
  res.status(404).send();
});

formARouter.get("/:id",
  [param("id").isMongoId().notEmpty()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let item = await loadSingleAuthority(req, id);

    if (item) {
      if (item.deactivation)
        item.status = "Archived";
      else if (item.activation) {
        item.status = "Active";
      }
      else item.status = "Inactive (Draft)";

      let db = req.store.Authorities as GenericService<Authority>;
      let connectedAuthorizations = await db.getAll({ form_a_id: item._id.toString() });

      item.active_authorities = connectedAuthorizations.filter(f => f.activation);

      return res.json({ data: item });
    }

    res.status(404).send();
  });

// formARouter.get ("/department/form-count", async (req: Request, res: Response) => {
//   let db = req.store.FormA as GenericService<FormA>;
//   let pipeline =
//     [
//       {$match: {}},
//       {$group:
//         {
//           _id:"$department_descr",
//           count: {$sum:1 }
//         }
//       }
//     ]

//   let count = await db.aggregate(pipeline)

//   // if (count)
//     return res.json({ "form_a_count": count });
//   // res.status(404).send();
// })
formARouter.get("/department/position-count", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let pipeline =
    [
      { $unwind: "$authority_lines" },
      // {$match: {}},
      {
        $group:
        {
          _id: { department_code: "$department_code", department_descr: "$department_descr" },
          position_count: { $sum: 1 }
        }
      }
    ];

  let count = await db.aggregate(pipeline);

  // if (count)
  return res.json({ "form_a_count": count });
  // res.status(404).send();
});

formARouter.get("/department/:department", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let department_code = req.params.department;

  let list = await db.getAll({ "department_code": department_code }, { program_branch: 1, activity: 1, position: 1 });

  if (list) {
    for (let item of list) {
      if (item.deactivation)
        item.status = "Archived";
      else if (item.activation) {
        item.status = "Active";
      }
      else item.status = "Inactive (Draft)";

      if (item.activity)
        item.program_activity = `${item.program_branch} : ${item.activity}`;
      else item.program_activity = item.program_branch;
    }

    return res.json({ data: list });
  }

  res.status(404).send();
});

formARouter.get("/department/:department/program", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let department_code = req.params.department;

  let list = await db.getAll({ "department_code": department_code }, { program_branch: 1 });
  let programs = list.map(d => d.program_branch);
  programs = _.uniq(programs);

  res.json({ data: programs });
});

formARouter.get("/department/:department/activity", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let department_code = req.params.department;

  let list = await db.getAll({ "department_code": department_code, activity: { $ne: null } }, { activity: 1 });
  let activities = list.map(d => d.activity);
  activities = _.uniq(activities);

  res.json({ data: activities });
});

formARouter.get("/department/:department/program/:program_branch/activity", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let department_code = req.params.department;
  let { program_branch } = req.params;

  let list = await db.getAll({ "department_code": department_code, program_branch, activity: { $ne: null } }, { activity: 1 });
  let activities = list.map(d => d.activity);
  activities = _.uniq(activities);

  res.json({ data: activities });
});

formARouter.post("/department/:department/branch", async (req: Request, res: Response) => {
  //Return a list of FormA positions for a branch which is send in the body of a POST request
  let db = req.store.FormA as GenericService<FormA>;
  let department_code = req.params.department;

  let program_branch = req.body.program_branch;

  let list = await db.getAll({ "department_code": department_code, "program_branch": program_branch }, { position: 1 });

  if (list) {
    for (let item of list) {
      if (item.deactivation)
        item.status = "Archived";
      else if (item.activation) {
        item.status = "Active";
      }
      else item.status = "Inactive (Draft)";
    }

    return res.json({ data: list });
  }

  res.status(404).send();
});

formARouter.get("/department/:department/count", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let department_code = req.params.department;
  // console.log (`Asking for a count of dept ${department_code}`)
  let pipeline =
    [
      { $match: { "department_code": department_code } },
      { $unwind: "$authority_lines" },
      // {$match: {}},
      {
        $group:
        {
          _id: { department_code: "$department_code", department_descr: "$department_descr" },
          position_count: { $sum: 1 }
        }
      }
    ];
  let count = await db.aggregate(pipeline);
  // let count = await db.count({"department_code": department_code})
  if (count.length == 1)
    return res.json(count[0]);
  res.status(404).send();
});

// formARouter.get("/:id/pdf",
//   [param("id").isMongoId().notEmpty()], ReturnValidationErrors,
//   async (req: Request, res: Response) => {
//     const { id } = req.params;
//     let item = await loadSingleAuthority(req, id);

//     if (item) {
//       const PDF_TEMPLATE = fs.readFileSync(__dirname + "/../templates/FormBTemplate.html")

//       let t = new ExpressHandlebars();
//       const template = t.handlebars.compile(PDF_TEMPLATE.toString(), {})
//       let data = template(item);

//       let pdf = await generatePDF(data)
//       res.setHeader('Content-disposition', 'attachment; filename="FormB.pdf"');
//       res.setHeader('Content-type', 'application/pdf');
//       res.send(pdf);
//     }

//     res.status(404).send();
//   });

formARouter.put("/:id",
  [param("id").isMongoId().notEmpty()], ReturnValidationErrors, checkJwt, loadUser,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let db = req.store.FormA as GenericService<FormA>;

    req.body.updated_on = new Date();
    req.body.updated_by = req.user.email;

    let existing = await db.getById(id);

    // If archiving a form note the details
    if (req.query.archive == "true") {
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
    else {
      req.body.audit_lines.push({
        date: new Date(),
        user_name: req.user.email,
        action: "Update",
        previous_value: existing
      });
    }

    /* ----------------- Form A Version History ------------------------------
    //Eventually something like this should be done to keep version history
    let oldItem = await loadSingleAuthority(req, id);
    req.body.revision = []
    req.body.revision.push({
      revisedAt: new Date(),
      revisedBy: req.user.email,
      revisedBySub: req.user.sub,
      previousVersion: oldItem
    })
    */
    // if (req.body.department_id)
    //   req.body.department_id = new ObjectId(req.body.department_id);

    //RA: this should be the ID of the person creating the FormA I think
    if (req.body.employee_id)
      req.body.employee_id = new ObjectId(req.body.employee_id);
    // console.log(req.body.authority_lines[0])
    for (let line of req.body.authority_lines) {

      let codingIsValid = await questService.accountPatternIsValid(line.coding);

      console.log("CODING IS VALID: ", codingIsValid)


      let coding = `${line.coding.replace(/[^0-9]/g, "")}*************************`;
      line.dept = coding.substring(0, 2);
      line.vote = coding.substring(2, 3);
      line.prog = coding.substring(3, 5);
      line.activity = coding.substring(5, 7);
      line.element = coding.substring(7, 9);
      line.allotment = coding.substring(9, 11);
      line.object = coding.substring(9, 13);
      line.ledger1 = coding.substring(13, 17);
      line.ledger2 = coding.substring(17, 22);
      delete line.account;

      line.contracts_for_goods_services = line.contracts_for_goods_services === "0" ? "" : line.contracts_for_goods_services;
      line.loans_and_guarantees = line.loans_and_guarantees === "0" ? "" : line.loans_and_guarantees;
      line.transfer_payments = line.transfer_payments === "0" ? "" : line.transfer_payments;
      line.authorization_for_travel = line.authorization_for_travel === "0" ? "" : line.authorization_for_travel;
      line.request_for_goods_services = line.request_for_goods_services === "0" ? "" : line.request_for_goods_services;
      line.assignment_authority = line.assignment_authority === "0" ? "" : line.assignment_authority;
      line.s29_performance_limit = line.s29_performance_limit === "0" ? "" : line.s29_performance_limit;
      line.s30_payment_limit = line.s30_payment_limit === "0" ? "" : line.s30_payment_limit;
    }

    await db.update(id, req.body);

    let item = await loadSingleAuthority(req, id);
    res.json({ data: item });
  });

formARouter.post("/",
  checkJwt, loadUser,
  async (req: Request, res: Response) => {
    // console.log(`In post FormA`)
    // console.log(req.body)
    let db = req.store.FormA as GenericService<FormA>;

    req.body.created_on = new Date();
    req.body.created_by = req.user.email;

    req.body.audit_lines = [{
      date: new Date(),
      user_name: req.user.email,
      action: "Position created"
    }];

    let created = await db.create(req.body);
    let item = await loadSingleAuthority(req, created.insertedId.toString());
    res.json({ data: item });
  });



/* formARouter.post('/', async (req: Request, res: Response) => {
  //post object {user: "YNETUsername", account: "full-accuont-code"}
  //returns true and the value and type of approval
  return res.json({"TESTING": "crap"});
}); */

// formARouter.get('/account/:account', async (req: Request, res: Response) => {
//   //return all the authorites assigned to the account
//   return res.json({ "params": req.params });
// });
// formARouter.post('/account/:account', async (req: Request, res: Response) => {
//   //return all the authorites assigned to the account
//   // -----------
//   let a: any = req.store as Storage
//   // await a.Authorities.create({"thing":"the other thing"})
//   // -----------
//   return res.json({});
// });

// formARouter.get('/:myAuthorities', async (req: Request, res: Response) => {
//   //return a list of all the authorites assigned to my (YNET username)
//   return res.json({ "params": req.params });
// });

async function loadSingleAuthority(req: Request, id: string): Promise<any> {

  let db = req.store.FormA as GenericService<FormA>;
  // let depDb = req.store.Departments as GenericService<Department>;
  // let empDb = req.store.Employees as GenericService<Employee>;
  let item = await db.getById(id);

  if (item) {
    // item.department = await depDb.getOne({ _id: item.department_id });
    // item.employee = await empDb.getOne({ _id: new ObjectId(item.employee_id) });

    if (item.issue_date)
      item.issue_date = moment(item.issue_date).utc(false).format("YYYY-MM-DD");

    if (!item.audit_lines)
      item.audit_lines = [];

    for (let audit of item.audit_lines) {
      audit.date_display = moment(audit.date).format("YYYY-MM-DD @ h:mm a");
    }

    if (item.authority_lines) {
      for (let line of item.authority_lines) {
        line.coding_display = FormatCoding(line.coding);


        /*   line.account = `${line.dept}${line.vote}-${line.prog}${line.activity}${line.element}-${line.object}-${line.ledger1}-${line.ledger2}`;

          line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "");
          line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "");
          line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "");
          line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "");
          line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "");
          line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "");
          line.account = line.account.replace(/\*+$/g, "").replace(/-$/g, "");
          if (line.account.length < 26)
            line.account += "*"; */
      }
    }
    return item;
  }

  return undefined;
}
