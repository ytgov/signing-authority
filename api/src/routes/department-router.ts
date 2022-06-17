import express, { Request, Response } from "express";
import { RequiresData } from "../middleware";
import _ from "lodash";
import { QuestService } from "../services";

export const departmentRouter = express.Router();
departmentRouter.use(RequiresData);

const questService = new QuestService();


departmentRouter.get('/', async (req: Request, res: Response) => {
  let depts = await questService.getDepartmentList();

  for (let d of depts) {
    d.form_a_count = Math.floor(Math.random() * 1000);
    d.form_b_count = Math.floor(Math.random() * 1000);
  }

  res.json({ data: depts });
});

departmentRouter.get('/:id', async (req: Request, res: Response) => {
  let depts = await questService.getDepartmentList();
  const { id } = req.params;

  let dept = depts.filter((dline: any) => dline.dept == id)[0];

  if (dept) {
    dept.form_a_count = Math.floor(Math.random() * 1000);
    dept.form_b_count = Math.floor(Math.random() * 1000);
    dept.form_b_active = [
      { name: "Michael Johnson", position: "Director, Marketing" },
      { name: "Ryan Agar", position: "ADM, Finance and Admin" },
      { name: "Sawyer Johnson", position: "Manager, Special Projects" }];

    dept.form_a_active = [{ position: "Director, Marketing" },
    { position: "Director" },
    { position: "ADM" }]

    return res.json({ data: dept });
  }

  res.status(404).send("Departent not found")
});

departmentRouter.get('/:id/form-a', async (req: Request, res: Response) => {
  const { id } = req.params;

  let list = [{ position: "Director, Marketing" },
  { position: "Director" },
  { position: "ADM" }]

  res.json({ data: list })
});

departmentRouter.get('/:id/form-b', async (req: Request, res: Response) => {
  const { id } = req.params;

  let list = [
    { name: "Michael Johnson", position: "Director, Marketing" },
    { name: "Ryan Agar", position: "ADM, Finance and Admin" },
    { name: "Sawyer Johnson", position: "Manager, Special Projects" }];

  res.json({ data: list })
});


/*
departmentRouter.get('/:id', async (req: Request, res: Response) => {
  let db = req.store.Departments as GenericService<Department>;
  let { id } = req.params;
  let item = await db.getOne({ _id: new ObjectId(id) });

  return res.json({ data: item });
});
 */