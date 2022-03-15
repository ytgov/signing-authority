import express, { Request, Response } from "express";
import { RequiresData } from "../middleware";
import _ from "lodash";
import { EnsureAuthenticated } from "./auth";
import { GenericService } from "../services";
import { Department } from "../data/models";

export const departmentRouter = express.Router();
departmentRouter.use(RequiresData, EnsureAuthenticated);

departmentRouter.get('/', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  let db = req.store.Departments as GenericService<Department>;

  return res.json({ data: await db.getAll({}) });
});