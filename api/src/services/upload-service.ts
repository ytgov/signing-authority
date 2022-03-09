import { NextFunction, Request, Response } from "express";
import {doStuff} from "../middleware/upload";
// const dbConfig = require("../config/db");
// const MongoClient = require("mongodb").MongoClient;
// const GridFSBucket = require("mongodb").GridFSBucket;

import multer from "multer";
import { MongoClient } from "mongodb";
import { GridFsStorage } from "multer-gridfs-storage";
import { MONGO_DB, MONGO_URL } from "../config";
// const upload = multer({ dest: 'uploads/' })

const upload = multer({ dest: 'uploads/' });
const storage = new GridFsStorage({url: 'mongodb://yourhost:27017/database'});

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {

  const client = await MongoClient.connect(`${MONGO_URL}`);
  const db = client.db(MONGO_DB);
  const MongoStorage = new GridFsStorage({ db, client});
  console.log(MongoStorage.connected)
  // MongoStorage.fromStream()

  next()

}

// const uploadFiles = async (req: Request, res: Response) => {
//   try {
//     await upload(req, res);
//     console.log(req.file);
//     if (req.file == undefined) {
//       return res.send({
//         message: "You must select a file.",
//       });
//     }
//     return res.send({
//       message: "File has been uploaded.",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.send({
//       message: "Error when trying upload image: ${error}",
//     });
//   }
// };
// const getListFiles = async (req: Request, res: Response) => {
//   try {
//     await mongoClient.connect();
//     const database = mongoClient.db(dbConfig.database);
//     const images = database.collection(dbConfig.imgBucket + ".files");
//     const cursor = images.find({});
//     if ((await cursor.count()) === 0) {
//       return res.status(500).send({
//         message: "No files found!",
//       });
//     }
//     let fileInfos = [];
//     await cursor.forEach((doc) => {
//       fileInfos.push({
//         name: doc.filename,
//         url: baseUrl + doc.filename,
//       });
//     });
//     return res.status(200).send(fileInfos);
//   } catch (error) {
//     return res.status(500).send({
//       message: error.message,
//     });
//   }
// };
// const download = async (req: Request, res: Response) => {
//   try {
//     await mongoClient.connect();
//     const database = mongoClient.db(dbConfig.database);
//     const bucket = new GridFSBucket(database, {
//       bucketName: dbConfig.imgBucket,
//     });
//     let downloadStream = bucket.openDownloadStreamByName(req.params.name);
//     downloadStream.on("data", function (data) {
//       return res.status(200).write(data);
//     });
//     downloadStream.on("error", function (err) {
//       return res.status(404).send({ message: "Cannot download the Image!" });
//     });
//     downloadStream.on("end", () => {
//       return res.end();
//     });
//   } catch (error) {
//     return res.status(500).send({
//       message: error.message,
//     });
//   }
// };
// module.exports = {
//   uploadFiles,
//   getListFiles,
//   download,
// };