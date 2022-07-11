import express, { Request, response, Response } from "express";
import { RequiresData } from "../middleware";
import _ from "lodash";
import { QuestService } from "../services";
import axios from "axios";
import { apiBaseUrl } from "../config";

export const departmentRouter = express.Router();
departmentRouter.use(RequiresData);

const questService = new QuestService();


departmentRouter.get('/', async (req: Request, res: Response) => {
  let depts = await questService.getDepartmentList();

  for (let d of depts) {
    let formACountURL = `${apiBaseUrl}/api/form-a/department/${d.dept}/count`
    let fromBCountURL =  `${apiBaseUrl}/api/form-b/department/${d.dept}/count`
    // d.form_a_count = Math.floor(Math.random() * 1000);
    await axios.get(formACountURL)
    .then((response) => {
      d.form_a_count = response.data.position_count
    })
    .catch((error) => {
      console.error (`Could not find Form A count for ${d.dept} - ${d.descr}`)
      d.form_a_count = 0
    })
    d.form_b_count = Math.floor(Math.random() * 1000);
    d.display_name = `(${d.dept}) ${d.descr}`;
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
      { name: "Red Green", position: "Director, Marketing", _id: "554334" },
      { name: "Dave Matthews", position: "ADM, Finance and Admin", _id: "554334" },
      { name: "Celine Dion", position: "Manager, Special Projects", _id: "554334" }];

    dept.form_a_active = [{ position: "Director, Marketing", _id: "554334" },
    { position: "Director", _id: "554334" },
    { position: "ADM", _id: "554334" }]

    return res.json({ data: dept });
  }

  res.status(404).send("Departent not found")
});

departmentRouter.get('/:id/form-a', async (req: Request, res: Response) => {
  const { id } = req.params;

  let list = [{ position: "Director, Marketing", _id: "23432432" },
  { position: "Director", _id: "12345" },
  { position: "ADM", _id: "554334" }]

  res.json({ data: list })
});

departmentRouter.get('/:id/form-b', async (req: Request, res: Response) => {
  const { id } = req.params;

  let list = [
    { name: "Red Green", position: "Director, Marketing", _id: "554334" },
    { name: "Dave Matthews", position: "ADM, Finance and Admin", _id: "554334" },
    { name: "Celine Dion", position: "Manager, Special Projects", _id: "554334" }];

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