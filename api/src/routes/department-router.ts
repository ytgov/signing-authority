import express, { Request, Response } from "express";

export const departmentRouter = express.Router();

const departList = require("../data/departments.json");

departmentRouter.get("/", async (req: Request, res: Response) => {
  let depts = departList;

  for (let d of depts) {
    d.display_name = `(${d.dept}) ${d.descr}`;
  }

  res.json({ data: depts });
});
