import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { MONGO_URL } from "../config";
import { StoredFile } from "../data/models";
import { MongoFileStore } from "../utils/mongo-file-store";

export const uploadsRouter = express.Router();

uploadsRouter.get('/', async (req: Request, res: Response) => {
  let client = await MongoClient.connect(`${MONGO_URL}`);
  const fileStore = new MongoFileStore(client);
  let files = await fileStore.getAllFiles();
  return res.json({ data: files })

});

uploadsRouter.get('/poster/:user', async (req: Request, res: Response) => {
  //return all files uploaded by a given User
  // RA: This should probably go to a "reporting" api endpoint
  let { user } = req.params;
  let client = await MongoClient.connect(`${MONGO_URL}`);
  const fileStore = new MongoFileStore(client);
  let file = await fileStore.uploadedBy(user);
  return res.json({ data: file })
});

uploadsRouter.get('/:id', async (req: Request, res: Response) => {
  let { id } = req.params;
  let client = await MongoClient.connect(`${MONGO_URL}`);
  const fileStore = new MongoFileStore(client);
  let file = await fileStore.getFile(id);
  file.content = Buffer.from([]);

  console.log(file)

  return res.json({ data: file })
});

uploadsRouter.get('/:id/file', async (req: Request, res: Response) => {
  let { id } = req.params;
  let client = await MongoClient.connect(`${MONGO_URL}`);
  const fileStore = new MongoFileStore(client);
  let file = await fileStore.getFile(id);

  res.setHeader("Content-Disposition", "attachment; filename=" + file.filename);
  return res.contentType(file.mimeType).send(file.content);
});

uploadsRouter.post('/', async (req: Request, res: Response) => {
  //let a:any = req.store as Storage
  ///console.log (a.mongoConnection.s.url)
  let client = await MongoClient.connect(`${MONGO_URL}`);

  const fileStore = new MongoFileStore(client);
  if (req.files) {
    let file = req.files["file"];

    if (Array.isArray(file))
      file = file[0];

    if (file) {
      let storedFile: StoredFile = {
        content: file.data,
        fileSize: file.size,
        filename: file.name,
        mimeType: file.mimetype,
        uploadedBy: req.body.user
      }

      let f = await fileStore.putFile(storedFile);

      return res.json({ data: f.id })
    }
  }
  
  res.status(500).send();
});

uploadsRouter.get('/myCard', async (req: Request, res: Response) => {
  //return a list of all the authorites assigned to my (YNET username)
  return res.json({ "params": req.params });
});
