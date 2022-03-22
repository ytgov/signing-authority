import express, { Request, Response } from "express";
import { RequiresData } from "../middleware";
import _ from "lodash";
import { EnsureAuthenticated } from "./auth";
import { GenericService } from "../services";
import { Department } from "../data/models";
import { ObjectId } from "mongodb";

export const departmentRouter = express.Router();
departmentRouter.use(RequiresData, EnsureAuthenticated);

departmentRouter.get('/', async (req: Request, res: Response) => {
  let db = req.store.Departments as GenericService<Department>;

  return res.json({ data: await db.getAll({}) });
});

departmentRouter.get('/:id', async (req: Request, res: Response) => {
  let db = req.store.Departments as GenericService<Department>;
  let { id } = req.params;
  let item = await db.getOne({ _id: new ObjectId(id) });

  return res.json({ data: item });
});
