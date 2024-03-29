import express, { Request, Response } from "express";
import axios from "axios";
import { RequiresData } from "../middleware";
import { INTEGRATION_ENDPOINT_URL } from "../config";
import { GenericService } from "src/services";
import { Authority, Position, setAuthorityStatus, setPositionStatus } from "src/data/models";
import { pick, startCase } from "lodash";

export const reportsRouter = express.Router();
reportsRouter.use(RequiresData);

reportsRouter.get("/vroozi/audit", async (req: Request, res: Response) => {
  axios
    .get(`${INTEGRATION_ENDPOINT_URL.replace("/api/saa", "")}/audit/list`)
    .then((resp) => {
      res.json({ data: resp.data.data });
    })
    .catch((err) => {
      console.log("ERROR Connecting to Integration");
      res.json({ data: null });
    });
});

reportsRouter.get("/vroozi/logs", async (req: Request, res: Response) => {
  axios
    .get(`${INTEGRATION_ENDPOINT_URL.replace("/api/saa", "")}/audit/logs/ignore/100`)
    .then((resp) => {
      res.json({ data: resp.data.data });
    })
    .catch((err) => {
      console.log("ERROR Connecting to Integration");
      res.json({ data: null });
    });
});

reportsRouter.get("/vroozi/audit/:email", async (req: Request, res: Response) => {
  const { email } = req.params;

  axios
    .get(`${INTEGRATION_ENDPOINT_URL.replace("/api/saa", "")}/audit/email/${email}`)
    .then((resp) => {
      res.json({ data: resp.data.data });
    })
    .catch((err) => {
      console.log("ERROR Connecting to Integration");
      res.json({ data: null });
    });
});

reportsRouter.get("/vroozi/resend/:email", async (req: Request, res: Response) => {
  const { email } = req.params;

  axios
    .get(`${INTEGRATION_ENDPOINT_URL}/authority-changed/${email}`)
    .then((resp) => {
      console.log("HERE", resp.data);
      res.json({ data: resp.data });
    })
    .catch((err) => {
      console.log("ERROR Connecting to Integration");
      res.json({ data: null });
    });
});

reportsRouter.get("/form-b", async (req: Request, res: Response) => {
  let db = req.store.Authorities as GenericService<Authority>;
  let list = await db.getAll({});
  let results = [];

  for (let item of list) {
    setAuthorityStatus(item);

    item.authority_type = startCase(item.authority_type);

    results.push(
      pick(item, [
        "_id",
        "status",
        "department_code",
        "department_descr",
        "authority_type",
        "employee.name",
        "employee.title",
        "employee.ynet_id",
        "program_branch",
        "activity",
        "authority_lines",
      ])
    );
  }
  res.json({ data: results });
});

reportsRouter.get("/position", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let list = await db.getAll({});
  let results = [];

  for (let item of list) {
    setPositionStatus(item);
    item.status = item.status ?? "Unknown";

    results.push(
      pick(item, [
        "_id",
        "status",
        "department_code",
        "department_descr",
        "program_branch",
        "activity",
        "position",
        "deactivation",
      ])
    );
  }

  res.json({ data: results });
});
