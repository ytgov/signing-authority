import express, { Request, response, Response } from "express";
import { Storage } from "../data";

import { uploadsRouter } from "./uploads"

import { body, param } from "express-validator";
import { RequiresData, ReturnValidationErrors } from "../middleware";
import { GenericService, UserService } from "../services";
import _ from "lodash";
import { EnsureAuthenticated } from "./auth";
import { Authority, Department, Employee } from "src/data/models";
import { ObjectId } from "mongodb";

export const authoritiesRouter = express.Router();
// userRouter.use(RequiresData, EnsureAuthenticated);

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
    let db = req.store.Authorities as GenericService<Authority>;
    let depDb = req.store.Departments as GenericService<Department>;
    let empDb = req.store.Employees as GenericService<Employee>;
    let item = await db.getById(id);

    if (item) {
      item.department = await depDb.getOne({ _id: item.department_id });
      item.employee = await empDb.getOne({ _id: new ObjectId(item.employee_id) });

      for (let line of item.authority_lines) {
        line.account = `${line.dept}${line.vote}-${line.prog}${line.activity}${line.element}-${line.object}-${line.ledger1}-${line.ledger2}`
      }

      return res.json({ data: item })
    }

    res.status(404).send();
  });

authoritiesRouter.put("/:id",
  [param("id").isMongoId().notEmpty()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let db = req.store.Authorities as GenericService<Authority>;
    let list = await db.getAll({})
    res.json({ data: list })
  })




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






