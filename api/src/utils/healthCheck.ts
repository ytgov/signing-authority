import { Request, Response } from "express";
import { MONGO_DB, MONGO_HOST } from "../config"
import { DepartmentService } from "../services/department-service";

export async function doHealthCheck(req: Request, res: Response) {
    //database check
    let data = req.store as Storage;
    let dbConnected = await data.isInitialized;

    //department API check
    const dept = new DepartmentService()
    let deptStatus = await dept.healthCheck()


    // if (!dbConnected)

    //     return res.status(500).send(`Not able to connect to <strong>${MONGO_DB}</strong> database on <strong>${MONGO_HOST}</strong>.`);

    // res.send(`Connection to database <strong>${MONGO_DB}</strong> on '<strong>${MONGO_HOST}</strong>' is connected and functioning.`);

    res.json({
        database: dbConnected,
        departmentAPI: deptStatus
    })
}
