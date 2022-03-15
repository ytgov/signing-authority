import express, { Request, Response } from "express";
import { RequiresData } from "../middleware";
import _ from "lodash";
import { EnsureAuthenticated } from "./auth";
import { GenericService } from "../services";
import { Employee } from "../data/models";

export const employeeRouter = express.Router();
employeeRouter.use(RequiresData, EnsureAuthenticated);

employeeRouter.get('/', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  let db = req.store.Employees as GenericService<Employee>;

  return res.json({ data: await db.getAll({}) });
});