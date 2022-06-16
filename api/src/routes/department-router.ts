import express, { Request, Response } from "express";
import { RequiresData } from "../middleware";
import _ from "lodash";
import { QuestService } from "../services";

export const departmentRouter = express.Router();
departmentRouter.use(RequiresData);

const questService = new QuestService();


departmentRouter.get('/', async (req: Request, res: Response) => {
  let depts = await questService.getDepartmentList();

  return res.json({ data: depts });
});
/* 
departmentRouter.get('/:id', async (req: Request, res: Response) => {
  let db = req.store.Departments as GenericService<Department>;
  let { id } = req.params;
  let item = await db.getOne({ _id: new ObjectId(id) });

  return res.json({ data: item });
});
 */