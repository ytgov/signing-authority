import express, { Request, Response } from "express";
import fs from "fs";
import _ from "lodash";
import moment from "moment";
import { param } from "express-validator";
import { ExpressHandlebars } from "express-handlebars";
import { uploadsRouter } from "./uploads";
import { ReturnValidationErrors } from "../middleware";
import { EmailService, GenericService, LimitService, QuestService, UserService } from "../services";
import { Authority, Position, ReviewResultType, setAuthorityStatus, StoredFile } from "../data/models";
import { FileStore } from "../utils/file-store";
import { generatePDF } from "../utils/pdf-generator";
import { CleanFilename, FormatCoding } from "../utils/formatters";

import { checkJwt, loadUser, isFormBAdmin, isFormBOrActingAdmin } from "../middleware/authz.middleware";
import { API_PORT } from "../config";

const questService = new QuestService();
const emailService = new EmailService();
const limitService = new LimitService();

export const authoritiesRouter = express.Router();

authoritiesRouter.use("/uploads", uploadsRouter);

authoritiesRouter.get("/", async (req: Request, res: Response) => {
  let db = req.store.Authorities as GenericService<Authority>;
  let list = await db.getAll({});

  for (let item of list) {
    setAuthorityStatus(item);
  }

  res.json({ data: list });
});

authoritiesRouter.get(
  "/:id",
  [param("id").isMongoId().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let item = await loadSingleAuthority(req, id);

    if (item) {
      if (!item.authority_type) item.authority_type = "substantive"; // polyfill for late model change
      return res.json({ data: item });
    }

    res.status(404).send();
  }
);

authoritiesRouter.get(
  "/:id/pdf",
  [param("id").isMongoId().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let item = await loadSingleAuthority(req, id);

    if (item) {
      const PDF_TEMPLATE = fs.readFileSync(__dirname + "/../templates/pdf/FormBTemplate.html");

      (item as any).API_PORT = API_PORT;

      if (item.authority_type == "temporary") item.authority_type = "TEMPORARY";
      else if (item.authority_type == "acting") item.authority_type = "ACTING";
      else item.authority_type = "SUBSTANTIVE";

      let t = new ExpressHandlebars();
      const template = t.handlebars.compile(PDF_TEMPLATE.toString(), {});
      let data = template(item);

      let name = CleanFilename(`${item.department_code}`);
      if (item.employee.name) name = `${name}-${CleanFilename(`${item.employee.name}`)}`;

      let pdf = await generatePDF(data);
      res.setHeader("Content-disposition", `attachment; filename="FormB_${name}.pdf"`);
      res.setHeader("Content-type", "application/pdf");
      res.send(pdf);
    }

    res.status(404).send();
  }
);

authoritiesRouter.post(
  "/:id/activate",
  checkJwt,
  loadUser,
  isFormBOrActingAdmin,
  [param("id").isMongoId().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let { date, expire_date, activate_reason, approve_user_email, approve_user_date } = req.body;
    let db = req.store.Authorities as GenericService<Authority>;

    let existing = await db.getById(id);

    if (existing) {
      existing.activation = existing.activation || [];
      existing.activation.push({
        date,
        expire_date,
        activate_reason,
        approve_user_email,
        activate_user_id: req.user._id,
        approve_user_date,
      });

      existing.audit_lines = existing.audit_lines || [];

      let activationType = "Substantive position";
      if (activate_reason == "temporary") activationType = "Temporary / term position";
      else if (activate_reason == "acting") activationType = "Acting appointment";

      if (activate_reason == "acting") {
        await emailService.sendFormBActingNotice(existing, approve_user_email);
      }

      existing.audit_lines.push({
        action: `${activationType} Scheduled`,
        date: new Date(),
        previous_value: {},
        user_name: `${req.user.first_name} ${req.user.last_name}`,
      });

      await db.update(id, existing);
    }
    let item = await loadSingleAuthority(req, id);
    return res.json({ data: item });
  }
);

authoritiesRouter.put(
  "/:id/cancel",
  checkJwt,
  loadUser,
  isFormBAdmin,
  [param("id").isMongoId().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let db = req.store.Authorities as GenericService<Authority>;
    let existing = await db.getById(id);

    if (existing) {
      existing.audit_lines = existing.audit_lines || [];

      existing.audit_lines.push({
        action: "Cancelled",
        date: new Date(),
        previous_value: {},
        user_name: `${req.user.first_name} ${req.user.last_name}`,
      });

      for (let act of existing.activation || []) {
        act.archive_reason = "Form B Cancelled";
      }

      existing.cancel_by_name = `${req.user.first_name} ${req.user.last_name}`;
      existing.cancel_date = new Date();

      await db.update(id, existing);

      let item = await loadSingleAuthority(req, id);
      return res.json({ data: item });
    }

    res.status(404).send();
  }
);

authoritiesRouter.put(
  "/:id",
  checkJwt,
  loadUser,
  isFormBAdmin,
  [param("id").isMongoId().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { save_action, comments } = req.body;
    let db = req.store.Authorities as GenericService<Authority>;
    let userDb = req.store.Users as UserService;
    let fileStore = req.store.Files as FileStore;
    let positionDb = req.store.FormA as GenericService<Position>;

    let existing = await db.getById(id);

    if (!existing) return res.status(404).send();
    //if (req.body.department_id) req.body.department_id = new ObjectId(req.body.department_id);
    //if (req.body.employee_id) req.body.employee_id = new ObjectId(req.body.employee_id);

    if (!existing.authority_type) existing.authority_type = "substantive"; // polyfill for late model change

    //this is workflow stuff
    if (save_action) {
      if (save_action == "Lock") {
        existing.department_reviews = [
          {
            user_id: req.user._id,
            name: `${req.user.first_name} ${req.user.last_name}`,
            date: new Date(),
            note: comments,
            result: ReviewResultType.Approved,
          },
        ];

        existing.audit_lines = existing.audit_lines || [];

        existing.audit_lines.push({
          action: "Locked for Signatures",
          date: new Date(),
          previous_value: {},
          user_name: `${req.user.first_name} ${req.user.last_name}`,
        });

        let creator = await userDb.getAll({ _id: existing.created_by_id });

        await emailService.sendFormBNotification(
          existing,
          creator,
          "Upload Signatures",
          `${req.user.first_name} ${req.user.last_name}`
        );

        await db.update(id, existing);
      } else if (save_action == "Reset") {
        existing.department_reviews = undefined;
        existing.upload_signatures = undefined;
        existing.finance_reviews = undefined;

        existing.audit_lines = existing.audit_lines || [];

        existing.audit_lines.push({
          action: "Unlock and Rewind",
          date: new Date(),
          previous_value: {},
          user_name: `${req.user.first_name} ${req.user.last_name}`,
        });

        await db.update(id, existing);
      } else if (save_action == "UploadSignatures") {
        if (req.files && req.files.file) {
          let file = req.files.file;

          if (Array.isArray(file)) file = file[0];

          let storedFile: StoredFile = {
            content: file.data,
            file_size: file.size,
            filename: file.name,
            mime_type: file.mimetype,
            uploaded_by: `${req.user.first_name} ${req.user.last_name}`,
          };

          let fileInfo = await fileStore.putFile(storedFile);

          if (fileInfo && fileInfo._id) {
            existing.audit_lines = existing.audit_lines || [];

            existing.audit_lines.push({
              action: "Upload Signatures",
              date: new Date(),
              previous_value: {},
              user_name: `${req.user.first_name} ${req.user.last_name}`,
            });

            existing.upload_signatures = {
              id: req.user._id,
              name: `${req.user.first_name} ${req.user.last_name}`,
              date: new Date(),
              file_id: fileInfo._id,
            };

            let emailUsers = await userDb.getAll({ roles: "Department of Finance" });

            await emailService.sendFormBNotification(
              existing,
              emailUsers,
              "Finance Approve",
              `${req.user.first_name} ${req.user.last_name}`
            );

            await db.update(id, existing);
          }
        }
      } else if (save_action == "FinanceApproveApprove") {
        existing.finance_reviews = [
          {
            user_id: req.user._id,
            name: `${req.user.first_name} ${req.user.last_name}`,
            date: new Date(),
            note: comments,
            result: ReviewResultType.Approved,
          },
        ];

        /* existing.activation = existing.activation || [];
        let activation = {
          date: new Date(), // this date should be configurable
          activate_reason: "Activation",
          activate_user_id: req.user._id,
        };
        existing.activation.push(activation); */

        existing.audit_lines = existing.audit_lines || [];
        existing.audit_lines.push({
          action: "Finance Approved",
          date: new Date(),
          previous_value: {},
          user_name: `${req.user.first_name} ${req.user.last_name}`,
        });

        let creator = await userDb.getAll({ _id: existing.created_by_id });

        await emailService.sendFormBNotification(
          existing,
          creator,
          `Approved Form B for ${existing.employee.name}`,
          `${req.user.first_name} ${req.user.last_name}`
        );

        //await emailService.sendFormBActiveNotice(existing, moment(activation.date).format("MMMM D, YYYY"));

        await db.update(id, existing);
      } else if (save_action == "FinanceApproveReject") {
        existing.department_reviews = undefined;
        existing.upload_signatures = undefined;
        existing.finance_reviews = undefined;

        existing.audit_lines = existing.audit_lines || [];

        existing.audit_lines.push({
          action: "Finance Rejected",
          date: new Date(),
          previous_value: {},
          user_name: `${req.user.first_name} ${req.user.last_name}`,
        });

        let creator = await userDb.getAll({ _id: existing.created_by_id });

        await emailService.sendFormBNotification(
          existing,
          creator,
          "Finance Approve Rejected",
          `${req.user.first_name} ${req.user.last_name}`
        );

        await db.update(id, existing);
      }

      return res.send("WORKING");
    }
    //this is basic editing
    else {
      let existing = await db.getById(id);

      if (existing) {
        delete existing.audit_lines;

        req.body.audit_lines.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Update",
          previous_value: existing,
        });

        let myFormA = await positionDb.getById(existing.form_a_id.toString());

        if (!myFormA) {
          return res.status(500).send("Cannot find FormA for this FormB");
        }

        for (let line of req.body.authority_lines) {
          let codingIsValid = await questService.accountPatternIsValid(line.coding);

          if (!codingIsValid) return res.status(400).send(`Invalid account code '${line.coding}'`);

          line.s24_procure_goods_limit = line.s24_procure_goods_limit === "0" ? "" : line.s24_procure_goods_limit;
          line.s24_procure_services_limit =
            line.s24_procure_services_limit === "0" ? "" : line.s24_procure_services_limit;
          line.s24_procure_request_limit = line.s24_procure_request_limit === "0" ? "" : line.s24_procure_request_limit;
          line.s24_procure_assignment_limit =
            line.s24_procure_assignment_limit === "0" ? "" : line.s24_procure_assignment_limit;
          line.s23_procure_goods_limit = line.s23_procure_goods_limit === "0" ? "" : line.s23_procure_goods_limit;
          line.s23_procure_services_limit =
            line.s23_procure_services_limit === "0" ? "" : line.s23_procure_services_limit;
          line.s24_transfer_limit = line.s24_transfer_limit === "0" ? "" : line.s24_transfer_limit;
          line.s23_transfer_limit = line.s23_transfer_limit === "0" ? "" : line.s23_transfer_limit;
          line.s24_travel_limit = line.s24_travel_limit === "0" ? "" : line.s24_travel_limit;
          line.other_limit = line.other_limit === "0" ? "" : line.other_limit;
          line.loans_limit = line.loans_limit === "0" ? "" : line.loans_limit;
          line.trust_limit = line.trust_limit === "0" ? "" : line.trust_limit;
          line.s29_performance_limit = line.s29_performance_limit === "0" ? "" : line.s29_performance_limit;
          line.s30_payment_limit = line.s30_payment_limit === "0" ? "" : line.s30_payment_limit;

          if (myFormA) {
            let limitError = limitService.checkFormBLineLimits(myFormA, line);

            if (limitError) return res.status(400).send(limitError);
          }
        }

        await db.update(id, req.body);
      }
      let item = await loadSingleAuthority(req, id);
      return res.json({ data: item });
    }
  }
);

authoritiesRouter.delete(
  "/:id",
  checkJwt,
  isFormBAdmin,
  [param("id").isMongoId().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let db = req.store.Authorities as GenericService<Authority>;

    await db.delete(id);
    res.json({});
  }
);

authoritiesRouter.post("/", checkJwt, loadUser, isFormBAdmin, async (req: Request, res: Response) => {
  let db = req.store.Authorities as GenericService<Authority>;

  req.body.audit_lines = [
    {
      date: new Date(),
      user_name: `${req.user.first_name} ${req.user.last_name}`,
      action: "Form B created",
    },
  ];

  req.body.created_by_id = req.user._id;
  req.body.created_by = `${req.user.first_name} ${req.user.last_name}`;
  req.body.create_date = new Date();

  let created = await db.create(req.body);
  let item = await loadSingleAuthority(req, created.insertedId.toString());
  res.json({ data: item });
});

/* authoritiesRouter.post('/', async (req: Request, res: Response) => {
  //post object {user: "YNETUsername", account: "full-accuont-code"}
  //returns true and the value and type of approval
  return res.json({"TESTING": "crap"});
}); */

/* authoritiesRouter.get("/account/:account", async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  return res.json({ params: req.params });
});
authoritiesRouter.post("/account/:account", async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  // -----------
  let a: any = req.store as Storage;
  // await a.Authorities.create({"thing":"the other thing"})
  // -----------
  return res.json({});
}); */

/* authoritiesRouter.get("/:myAuthorities", async (req: Request, res: Response) => {
  //return a list of all the authorites assigned to my (YNET username)
  return res.json({ params: req.params });
}); */

async function loadSingleAuthority(req: Request, id: string): Promise<Authority | undefined> {
  let db = req.store.Authorities as GenericService<Authority>;
  let formADb = req.store.FormA as GenericService<Position>;

  let item = await db.getById(id);

  if (item) {
    if (!item.audit_lines) item.audit_lines = [];

    for (let audit of item.audit_lines) {
      audit.date_display = moment(audit.date).format("YYYY-MM-DD @ h:mm a");
    }

    item.form_a = await formADb.getById(item.form_a_id.toString());

    for (let line of item.authority_lines) {
      line.coding_display = FormatCoding(line.coding);
    }

    setAuthorityStatus(item);

    if (item.activation && item.activation.length > 0) {
      let lastActiviation = item.activation[item.activation.length - 1];
      item.issue_date_display = moment(lastActiviation.date).format("YYYY-MM-DD");
    }
    return item;
  }

  return undefined;
}

// Department Specific FORM B Routes
authoritiesRouter.get("/department/:department", async (req: Request, res: Response) => {
  let db = req.store.Authorities as GenericService<Authority>;
  let department_code = req.params.department;
  let list = await db.getAll({ department_code: department_code });

  for (let item of list) {
    setAuthorityStatus(item);
  }

  res.json({ data: list });
});
