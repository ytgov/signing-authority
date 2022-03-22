import express, { Request, Response } from "express";
import { RequiresData, ReturnValidationErrors } from "../middleware";
import _, { join } from "lodash";
import { EnsureAuthenticated } from "./auth";
import { GenericService } from "../services";
import { Authority, Department, Employee } from "../data/models";
import { body, param } from "express-validator";
import { ObjectId } from "mongodb";
import moment from "moment";

export const employeeRouter = express.Router();
employeeRouter.use(RequiresData, EnsureAuthenticated);

employeeRouter.get('/', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  let db = req.store.Employees as GenericService<Employee>;

  return res.json({ data: await db.getAll({}) });
});

employeeRouter.post('/search',
  [body("terms").notEmpty().trim()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { terms } = req.body;
    //return all the authorites assigned to the account

    let db = req.store.Employees as GenericService<Employee>;
    let reg = new RegExp(terms, "i")

    let list = await db.getAll({
      $or: [
        { "first_name": { $regex: reg } },
        { "last_name": { $regex: reg } },
        { "ynet_id": { $regex: reg } },
        { "employee_id": { $regex: reg } }]
    });

    for (let item of list) {
      item.display_name = `${item.first_name} ${item.last_name}`;
    }

    return res.json({ data: list });
  });

employeeRouter.get('/:id',
  [param("id").isMongoId()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let empDb = req.store.Employees as GenericService<Employee>;
    let autDb = req.store.Authorities as GenericService<Authority>;
    let depDb = req.store.Departments as GenericService<Department>;

    let { id } = req.params;
    let item = await empDb.getOne({ _id: new ObjectId(id) });

    if (item) {
      item.authorities = await autDb.getAll({ employee_id: new ObjectId(id) });

      for (let auth of item.authorities) {
        auth.department = await depDb.getOne({ _id: new ObjectId(auth.department_id) });

        if (auth.issue_date)
          auth.issue_date_display = moment(auth.issue_date).utc(false).format("YYYY-MM-DD");
      }

      return res.json({ data: item });
    }

    res.status(404).send();
  });
