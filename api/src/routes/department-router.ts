import express, { Request, Response } from "express";
import { RequiresData } from "../middleware";
import _ from "lodash";
import { QuestService, DepartmentService } from "../services";
import axios from "axios";
import { apiBaseUrl } from "../config";

export const departmentRouter = express.Router();
departmentRouter.use(RequiresData);

const questService = new QuestService();
const departmentService = new DepartmentService();

const departList = require("../data/departments.json");

departmentRouter.get("/", async (req: Request, res: Response) => {
  console.log;

  //let depts = await departmentService.getDepartmentList();
  let depts = departList

  // if (depts.length === 0) {
  //   depts = await departmentService.getOfflineDepartmentList();
  // }

  for (let d of depts) {
    /*  let formACountURL = `${apiBaseUrl}/api/form-a/department/${d.dept}/count`
    let formBCountURL = `${apiBaseUrl}/api/authority/department/${d.dept}/count`
    // d.form_a_count = Math.floor(Math.random() * 1000);
    await axios.get(formACountURL)
      .then((response) => {
        d.form_a_count = response.data.position_count
      })
      .catch((error) => {
        // console.error (`Could not find Form B count for ${d.dept} - ${d.descr}`)
        d.form_a_count = 0
      })
    await axios.get(formBCountURL)
      .then((response) => {
        d.form_b_count = response.data.position_count
      })
      .catch((error) => {
        // console.error (`Could not find Form A count for ${d.dept} - ${d.descr}`)
        d.form_b_count = 0
      })
    d.form_b_count = Math.floor(Math.random() * 1000);*/
    d.display_name = `(${d.dept}) ${d.descr}`;
  }

  res.json({ data: depts });
});

/* 
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
}); */
