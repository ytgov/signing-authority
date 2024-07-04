import express, { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import { RequiresData } from "../middleware";
import { API_PORT, INTEGRATION_ENDPOINT_URL } from "../config";
import { GenericService } from "../services";
import { Authority, Position, setAuthorityStatus, setHistoricAuthorityStatus, setPositionStatus } from "../data/models";
import { isArray, pick, startCase } from "lodash";
import { ExpressHandlebars } from "express-handlebars";
import { generatePDF } from "../utils/pdf-generator";
import moment from "moment";

const departList = require("../data/departments.json");

export const reportsRouter = express.Router();
reportsRouter.use(RequiresData);

reportsRouter.get("/vroozi/audit", async (req: Request, res: Response) => {
  axios
    .get(`${INTEGRATION_ENDPOINT_URL.replace("/api/saa", "")}/audit/list`)
    .then((resp) => {
      res.json({ data: resp.data.data });
    })
    .catch((err) => {
      console.log("ERROR Connecting to Integration", err);
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
      console.log("ERROR Connecting to Integration", err);
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
      console.log("ERROR Connecting to Integration", err);
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

reportsRouter.post("/audit", async (req: Request, res: Response) => {
  const { email, department, date } = req.body;
  let db = req.store.Authorities as GenericService<Authority>;
  let list = await db.getAll({ department_code: department, "employee.name": { $regex: email, $options: "i" } });

  let results = [];

  for (let item of list) {
    item.status = item.status ?? "Unknown";

    setHistoricAuthorityStatus(item, date);

    if (item.status == "Active") {
      for (const line of item.authority_lines) {
        results.push({
          ...pick(item, ["_id", "employee.name", "employee.title"]),
          ...line,
        });
      }
    }
  }

  res.json({ data: results });
});

reportsRouter.get("/audit/pdf", async (req: Request, res: Response) => {
  const { email, department, date } = req.query;

  let employeeFilter = (isArray(email) ? email[0] : email)?.toString() ?? "";
  let department_code = (isArray(department) ? department[0] : department)?.toString() ?? "";
  let statusDate = (isArray(date) ? date[0] : date)?.toString() ?? "";

  let db = req.store.Authorities as GenericService<Authority>;
  let list = await db.getAll({ department_code, "employee.name": { $regex: employeeFilter, $options: "i" } });

  let results = [];

  for (let item of list) {
    item.status = item.status ?? "Unknown";

    setHistoricAuthorityStatus(item, moment(statusDate).toDate());

    if (item.status == "Active") {
      for (const line of item.authority_lines) {
        results.push({
          ...pick(item, ["_id", "employee.name", "employee.title"]),
          ...line,
        });
      }
    }
  }

  const d = departList.find((d: any) => d.dept == department_code);

  const pdfData = { API_PORT: API_PORT, data: results, department_descr: `(${d.dept}) ${d.descr}`, date };

  const PDF_TEMPLATE = fs.readFileSync(__dirname + "/../templates/pdf/AuditReportTemplate.html");

  let t = new ExpressHandlebars();

  const template = t.handlebars.compile(PDF_TEMPLATE.toString(), {});
  let data = template(pdfData, {
    helpers: {
      eq: function (a1: string, a2: string) {
        return a1 == a2;
      },
    },
  });

  //res.send(data);

  let name = `${department}-${date}`;

  let pdf = await generatePDF(data);
  res.setHeader("Content-disposition", `attachment; filename="Authority_AUDIT_${name}.pdf"`);
  res.setHeader("Content-type", "application/pdf");
  res.send(pdf);
});
