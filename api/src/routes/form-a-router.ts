import express, { request, Request, Response } from "express";
import { body, param } from "express-validator";
import { Storage } from "../data";

import moment from "moment";
import _ from "lodash";
import { uploadsRouter } from "./uploads"
import { generatePDF } from "../utils/pdf-generator";
import { ReturnValidationErrors } from "../middleware";
import { GenericService, UserService } from "../services";

import { FormA } from "src/data/models";
import { ObjectId } from "mongodb";

import { operationalRestrictions } from "../data/models"
import { ExpressHandlebars } from "express-handlebars";
export const formARouter = express.Router();

import { checkJwt, loadUser } from "../middleware/authz.middleware";


// formARouter.use('/uploads', uploadsRouter)

formARouter.get("/operational-restrictions", (req:Request, res:Response) => {
  return res.json(operationalRestrictions)
})

formARouter.get("/", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let list = await db.getAll({})
  res.json({ data: list })
})
formARouter.get ("/count", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<FormA>;
  let count = await db.count({});
  if (count)
    return res.json({ "form_a_count": count });
  res.status(404).send();
})

formARouter.get("/:id",
  [param("id").isMongoId().notEmpty()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let item = await loadSingleAuthority(req, id);

    if (item)
      return res.json({ data: item });

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
  formARouter.get ("/department/position-count", async (req: Request, res: Response) => {
    let db = req.store.FormA as GenericService<FormA>;
    let pipeline =
      [
        { $unwind : "$authority_lines" },
        // {$match: {}},
        {$group:
          {
            _id:{department_code: "$department_code", department_descr:"$department_descr"},
            position_count: {$sum:1}
          }
        }
      ]

    let count = await db.aggregate(pipeline)

    // if (count)
      return res.json({ "form_a_count": count });
    // res.status(404).send();
  })
  formARouter.get ("/department/:department", async (req: Request, res: Response) => {
    let db = req.store.FormA as GenericService<FormA>;
    let department_code = req.params.department
    let list = await db.getAll({"department_code": department_code})
    if (list)
      return res.json({ data: list });
    res.status(404).send();
  });


  formARouter.get ("/department/:department/count", async (req: Request, res: Response) => {
    let db = req.store.FormA as GenericService<FormA>;

    let department_code = req.params.department
    // console.log (`Asking for a count of dept ${department_code}`)
    let pipeline =
      [
        { $match: {"department_code": department_code}},
        { $unwind : "$authority_lines" },
        // {$match: {}},
        {$group:
          {
            _id:{department_code: "$department_code", department_descr:"$department_descr"},
            position_count: {$sum:1}
          }
        }
      ]

    let count = await db.aggregate(pipeline)


    // let count = await db.count({"department_code": department_code})
    if (count.length == 1)
      return res.json( count[0] );
    res.status(404).send();
  })

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


    console.log(req.body)
    if (req.query.archive=="true") {
      console.log (`Archiving ${req.body.archived.reason}`)
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
    res.json({ data: item })
  });

formARouter.post("/",
  async (req: Request, res: Response) => {
    console.log(`In post FormA`)
    console.log(req.body)
    let db = req.store.FormA as GenericService<FormA>;


    // if (req.body.department_id)
    //   req.body.department_id = new ObjectId(req.body.department_id);

    let created = await db.create(req.body);
    let item = await loadSingleAuthority(req, created.insertedId.toString());
    res.json({ data: item })
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

    if (item.authority_lines) {
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
  }
    return item;
  }

  return undefined;
}
