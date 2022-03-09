import express, { Request, Response } from "express";


import {uploadFile} from "../services/upload-service"

export const uploadsRouter = express.Router();
// userRouter.use(RequiresData, EnsureAuthenticated);



uploadsRouter.post('/', uploadFile, async (req: Request, res: Response) => {
  //let a:any = req.store as Storage
  ///console.log (a.mongoConnection.s.url)
  let filename = req.file
  console.log("File:", req.file, "Body" ,req.body)
  console.log(req.body.user)

  return res.json({"file": filename?.originalname, "user": req.body.user});
});

uploadsRouter.post('/', async (req: Request, res: Response) => {
  let a:any = req.store as Storage

  //post object {user: "YNETUsername", account: "full-accuont-code"}
  //returns true and the value and type of approval

  return res.json({});
});

uploadsRouter.get('/account/:account', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  return res.json({"params":req.params});
});
uploadsRouter.post('/account/:account', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  // -----------
  let a:any = req.store as Storage
  // await a.Authorities.create({"thing":"the other thing"})
  // -----------
  return res.json({});
});

uploadsRouter.get('/:myAuthorities', async (req: Request, res: Response) => {
  //return a list of all the authorites assigned to my (YNET username)
 return res.json({"params":req.params});
});






