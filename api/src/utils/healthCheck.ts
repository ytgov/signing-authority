import { Request, Response } from "express";
import { MONGO_HOST } from "../config";

export async function doHealthCheck(req: Request, res: Response) {
  let appHealth = [];

  //database check
  let data = req.store as Storage;
  let dbConnected = await data.isInitialized;
  appHealth.push({
    name: "Database",
    status: dbConnected,
    loading: false,
    helpNotes: `Check that the databases is running at: ${MONGO_HOST}`,
  });

  res.json({
    appHealth,
  });
}
