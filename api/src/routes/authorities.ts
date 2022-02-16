import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import { RequiresData, ReturnValidationErrors } from "../middleware";
import { UserService } from "../services";
import _ from "lodash";
import { EnsureAuthenticated } from "./auth";

export const accountRouter = express.Router();
// userRouter.use(RequiresData, EnsureAuthenticated);

accountRouter.get('/:account',

async (req: Request, res: Response) => {
  let list = await db.getAll();

  for (let user of list) {
      user = await db.makeDTO(user)
  }

  return res.json({ data: list });
});
