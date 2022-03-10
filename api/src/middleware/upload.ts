// https://www.bezkoder.com/node-js-upload-store-images-mongodb/#Setup_Nodejs_modules
import {Request, Response, NextFunction} from "express";
import { Storage } from "src/data";
import util from "util"

import {MONGO_URL, MONGO_DB} from "../config"
import multer from "multer"
// const util = require("util");
// const multer = require("multer");
import {GridFsStorage} from 'multer-gridfs-storage';
import { MongoClient } from "mongodb";

// let storage = new ({})

const DiskStorage = multer.diskStorage({
  // Destination to store image
  destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, file.originalname)
        // cb(null, file.fieldname + '_' + Date.now()
        //    + path.extname(file.originalname))
          // file.fieldname is name of the field (image)
          // path.extname get the uploaded file extension
  }
});
console.log (`${MONGO_URL}/${MONGO_DB}`)

export async function doStuff (req:Request, res: Response, next: NextFunction) {
  const client = await MongoClient.connect(`${MONGO_URL}`);
  const db = client.db(MONGO_DB);
  const MongoStorage = new GridFsStorage({ db, client});
  next();
  return MongoStorage
}


// console.log (`${MONGO_URL}/${MONGO_DB}`)
// let MongoStorage = new GridFsStorage({
//   // db: null
//   url: `${MONGO_URL}/${MONGO_DB}`
//   // file: (req:Request, file:any) => {
//   // return {
//   //   bucketName: "FormB",
//   //   filename: `${Date.now()}-bezkoder-${file.originalname}`
//   //   };
//   // }
// });


// const uploadHandler = multer({ storage:DiskStorage }).single("file");
//  const uploadHandler = multer({ storage:MongoStorage }).single("file");
// export const upload = util.promisify(uploadHandler)