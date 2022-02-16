import { Request, Response } from "express";
import { MONGO_DB, MONGO_HOST } from "../config"

export async function doHealthCheck(req: Request, res: Response) {
    let data = req.store as Storage;
    let dbConnected = await data.isInitialized;

    if (!dbConnected)
        return res.status(500).send(`Not able to connect to <strong>${MONGO_DB}</strong> database on <strong>${MONGO_HOST}</strong>.`);

    res.send(`Connection to database <strong>${MONGO_DB}</strong> on '<strong>${MONGO_HOST}</strong>' is connected and functioning.`);
}
