import express, { Request, Response } from "express";
import { Storage } from "../data";

import { uploadsRouter } from "./uploads"

import { body, param } from "express-validator";
import { RequiresData, ReturnValidationErrors } from "../middleware";
import { GenericService, UserService } from "../services";
import _ from "lodash";
import { EnsureAuthenticated } from "./auth";
import { Authority } from "src/data/models";

export const authoritiesRouter = express.Router();
// userRouter.use(RequiresData, EnsureAuthenticated);

authoritiesRouter.use('/uploads', uploadsRouter)

authoritiesRouter.get("/", async (req: Request, res: Response) => {
  let db = req.store.Authorities as GenericService<Authority>;
  let list = await db.getAll({})
  res.json({ data: list })
})




/* authoritiesRouter.post('/', async (req: Request, res: Response) => {
  //post object {user: "YNETUsername", account: "full-accuont-code"}
  //returns true and the value and type of approval
  return res.json({"TESTING": "crap"});
}); */

authoritiesRouter.get('/account/:account', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  return res.json({ "params": req.params });
});
authoritiesRouter.post('/account/:account', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  // -----------
  let a: any = req.store as Storage
  // await a.Authorities.create({"thing":"the other thing"})
  // -----------
  return res.json({});
});

authoritiesRouter.get('/:myAuthorities', async (req: Request, res: Response) => {
  //return a list of all the authorites assigned to my (YNET username)
  return res.json({ "params": req.params });
});






