import express, { Request, Response } from "express";

import { VUE_APP_ } from "../config";

export const configRouter = express.Router();

configRouter.post("/", async (req: Request, res: Response) => {
  //return just the front variables
  //the logic for this could be paramaeterized and we could
  //have a config service that returns the config variables
  return res.json(VUE_APP_);
});

