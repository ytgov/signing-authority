import express, { Request, Response } from "express";
import fs from "fs";
import _ from "lodash";
import moment from "moment";
import { body, param } from "express-validator";
import { ExpressHandlebars } from "express-handlebars";
import { uploadsRouter } from "./uploads";
import { ReturnValidationErrors } from "../middleware";
import {
  CodeSearchService,
  EmailService,
  GenericService,
  IntegrationService,
  LimitService,
  QuestService,
  UserService,
} from "../services";
import {
  Authority,
  FormBAuthorityLine,
  Position,
  ReviewResultType,
  setAuthorityStatus,
  StoredFile,
} from "../data/models";
import { FileStore } from "../utils/file-store";
import { generatePDF } from "../utils/pdf-generator";
import { CleanFilename, FormatCoding } from "../utils/formatters";

import { checkJwt, loadUser, isFormBAdmin, isFormBOrActingAdmin } from "../middleware/authz.middleware";
import { API_PORT } from "../config";
import { ObjectId } from "mongodb";

const questService = new QuestService();
const emailService = new EmailService();
const limitService = new LimitService();
const integrationService = new IntegrationService();

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
      let data = template(item, {
        helpers: {
          eq: function (a1: string, a2: string) {
            return a1 == a2;
          },
        },
      });

      let name = CleanFilename(`${item.department_code}`);
      if (item.employee.name) name = `${name}-${CleanFilename(`${item.employee.name}`)}`;

      let pdf = await generatePDF(data);
      res.setHeader("Content-disposition", `attachment; filename="FormB_${name}.pdf"`);
      res.setHeader("Content-type", "application/pdf");
      res.send(Buffer.from(pdf));
    }

    res.status(404).send();
  }
);

authoritiesRouter.post("/bulk-pdf", ReturnValidationErrors, async (req: Request, res: Response) => {
  const { ids } = req.body;
  const idList = eval(ids);

  const PDF_TEMPLATE = fs.readFileSync(__dirname + "/../templates/pdf/FormBTemplate.html");

  let allItemData = "";

  for (let id of idList) {
    let item = await loadSingleAuthority(req, id);

    if (item) {
      (item as any).API_PORT = API_PORT;

      if (item.authority_type == "temporary") item.authority_type = "TEMPORARY";
      else if (item.authority_type == "acting") item.authority_type = "ACTING";
      else item.authority_type = "SUBSTANTIVE";

      let t = new ExpressHandlebars();

      const template = t.handlebars.compile(PDF_TEMPLATE.toString(), {});
      let data = template(item, {
        helpers: {
          eq: function (a1: string, a2: string) {
            return a1 == a2;
          },
        },
      });

      allItemData += data + '<div style="page-break-after: always;"></div>';
    }
  }

  let pdf = await generatePDF(allItemData);

  res.setHeader("Content-disposition", `attachment; filename="FormB_BULKPRINT.pdf"`);
  res.setHeader("Content-type", "application/pdf");
  res.send(Buffer.from(pdf));
});

authoritiesRouter.get(
  "/:id/pdf/draft",
  [param("id").isMongoId().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let item = await loadSingleAuthority(req, id);

    if (item) {
      const PDF_TEMPLATE = fs.readFileSync(__dirname + "/../templates/pdf/FormBTemplateDraft.html");

      (item as any).API_PORT = API_PORT;

      if (item.authority_type == "temporary") item.authority_type = "TEMPORARY";
      else if (item.authority_type == "acting") item.authority_type = "ACTING";
      else item.authority_type = "SUBSTANTIVE";

      let t = new ExpressHandlebars();

      const template = t.handlebars.compile(PDF_TEMPLATE.toString(), {});
      let data = template(item, {
        helpers: {
          eq: function (a1: string, a2: string) {
            return a1 == a2;
          },
        },
      });

      let name = CleanFilename(`${item.department_code}`);
      if (item.employee.name) name = `${name}-${CleanFilename(`${item.employee.name}`)}`;

      let pdf = await generatePDF(data);
      res.setHeader("Content-disposition", `attachment; filename="DRAFT-FormB_${name}.pdf"`);
      res.setHeader("Content-type", "application/pdf");
      res.send(Buffer.from(pdf));
    }

    res.status(404).send();
  }
);

authoritiesRouter.post(
  "/account-search",
  checkJwt,
  loadUser,
  [
    body("term")
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage("Minimum 5 digits")
      .bail()
      .isNumeric()
      .withMessage("Only number are allowed"),
  ],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { term, date } = req.body;
    let db = req.store.Authorities as GenericService<Authority>;
    let searchService = new CodeSearchService(db);

    if (!date) date = moment().startOf("day").format("YYYY-MM-DD");

    let results = await searchService.search(term, date);

    res.json({ data: results });
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
      existing.activation = existing.activation || new Array<any>();

      const newStartDate = moment(date);
      const newEndDate = moment(expire_date);
      let errorMessage = null;

      for (const existingActivation of existing.activation) {
        if (existingActivation.reject_user_date) continue;

        const existingStart = moment(existingActivation.date);
        const existingEnd = moment(existingActivation.expire_date ?? new Date("2100-12-31"));

        //check if start is between existing
        if (newStartDate.isBetween(existingStart, existingEnd, "day", "[]")) {
          errorMessage = "Effective date overlaps existing activation";
        } else if (newEndDate.isBetween(existingStart, existingEnd, "day", "[]")) {
          errorMessage = "Expiration date overlaps existing activation";
        } else if (newEndDate.isBetween(existingStart, existingEnd, "day", "[]")) {
          errorMessage = "Expiration date overlaps existing activation";
        } else if (existingStart.isBetween(newStartDate, newEndDate, "day", "[]")) {
          errorMessage = "Overlaps existing activation";
        }
      }

      if (errorMessage) {
        let item = await loadSingleAuthority(req, id);
        return res.json({ data: item, errors: [errorMessage] });
      }

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
        await emailService.sendFormBActingNotice(
          existing,
          approve_user_email,
          moment(date).format("MMMM D, YYYY"),
          moment(expire_date).format("MMMM D, YYYY")
        );
      } else if (activate_reason == "temporary") {
        await emailService.sendFormBTemporaryNotice(
          existing,
          moment(date).format("MMMM D, YYYY"),
          moment(expire_date).format("MMMM D, YYYY")
        );
      }

      existing.audit_lines.push({
        action: `${activationType} Scheduled`,
        date: new Date(),
        previous_value: {},
        user_name: `${req.user.first_name} ${req.user.last_name}`,
      });

      await db.update(id, existing);
      await integrationService.checkAuthorityChange(existing);
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
      await integrationService.checkAuthorityChange(existing);

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
  isFormBOrActingAdmin,
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
      existing.reject_comments = "";

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

        let creator = await userDb.getAll({
          $or: [
            { _id: existing.created_by_id },
            { _id: existing.created_by_id.toString() },
            { _id: new ObjectId(existing.created_by_id) },
          ],
        });

        await emailService.sendFormBUpload(
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

            await emailService.sendFormBReview(
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

        existing.audit_lines = existing.audit_lines || [];
        existing.audit_lines.push({
          action: "Finance Approved",
          date: new Date(),
          previous_value: {},
          user_name: `${req.user.first_name} ${req.user.last_name}`,
        });

        let creator = await userDb.getAll({
          $or: [
            { _id: existing.created_by_id },
            { _id: existing.created_by_id.toString() },
            { _id: new ObjectId(existing.created_by_id) },
          ],
        });

        await emailService.sendFormBApprove(
          existing,
          creator,
          `Approved Form B for ${existing.employee.name}`,
          `${req.user.first_name} ${req.user.last_name}`,
          existing.authority_type == "temporary" ? `<br/>You may now schedule this authority for activation.` : ""
        );

        if (existing.authority_type == "substantive") {
          existing.activation = existing.activation || [];
          existing.activation.push({
            date: moment().format("YYYY-MM-DD"),
            activate_reason: existing.authority_type,
            approve_user_email: req.user.email,
            activate_user_id: req.user._id,
            approve_user_date: new Date(),
          });

          await emailService.sendFormBActiveNotice(existing, moment().format("MMMM D, YYYY"), "until cancelled");
        }

        //await emailService.sendFormBActiveNotice(existing, moment().format("MMMM D, YYYY"), moment().format("MMMM D, YYYY"));

        await db.update(id, existing);
        await integrationService.checkAuthorityChange(existing);
      } else if (save_action == "FinanceApproveReject") {
        existing.department_reviews = undefined;
        existing.upload_signatures = undefined;
        existing.finance_reviews = undefined;

        existing.audit_lines = existing.audit_lines || [];

        existing.audit_lines.push({
          action: "Finance Rejected: " + comments,
          date: new Date(),
          previous_value: {},
          user_name: `${req.user.first_name} ${req.user.last_name}`,
        });

        let creator = await userDb.getAll({
          $or: [
            { _id: existing.created_by_id },
            { _id: existing.created_by_id.toString() },
            { _id: new ObjectId(existing.created_by_id) },
          ],
        });

        existing.reject_comments = comments;

        await emailService.sendFormBReject(
          existing,
          creator,
          "Finance Approve Rejected",
          `${req.user.first_name} ${req.user.last_name}`,
          `<br><span style="color:red; font-weight:bold">Rejection Comment: ${comments}</span>`
        );

        await db.update(id, existing);
      } else if (save_action == "SupervisorApproveActing") {
        delete existing.audit_lines;

        req.body.audit_lines.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Supervisor Approved Acting Appointment",
          previous_value: existing,
        });

        let effectiveDate = "";
        let expireDate = "";
        let creatorId = "";

        if (req.body.activation) {
          for (let act of req.body.activation) {
            if (act.editItem == true) {
              effectiveDate = moment(act.date).format("YYYY-MM-DD");
              expireDate = moment(act.expire_date).format("YYYY-MM-DD");
              creatorId = act.activate_user_id;
              delete act.editItem;
            }
          }
        }

        let creator = await userDb.getAll({
          $or: [{ _id: creatorId }, { _id: creatorId.toString() }, { _id: new ObjectId(creatorId) }],
        });

        await emailService.sendFormBActingApproveCreatorNotice(existing, creator, effectiveDate, expireDate);
        await emailService.sendFormBActingApproveNotice(existing, effectiveDate, expireDate);

        await db.update(id, req.body);
      } else if (save_action == "SupervisorRejectActing") {
        delete existing.audit_lines;

        req.body.audit_lines.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Supervisor Rejected Acting Appointment",
          previous_value: existing,
        });

        await db.update(id, req.body);
      } else if (save_action == "ActivationChange") {
        delete existing.audit_lines;

        req.body.audit_lines.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Activation Expiration Changed",
          previous_value: existing,
        });

        await db.update(id, req.body);
        await integrationService.checkAuthorityChange({ ...req.body, employee: existing.employee });
      } else if (save_action == "ActivationRemove") {
        delete existing.audit_lines;

        req.body.audit_lines.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Future Activation Removed",
          previous_value: existing,
        });

        await db.update(id, req.body);
        await integrationService.checkAuthorityChange({ ...req.body, employee: existing.employee });
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

        // check for duplicate coding/OR
        let dupCheckLine = req.body.authority_lines.map(
          (l: FormBAuthorityLine) => `${l.coding}#${l.operational_restriction || ""}`
        );

        let dupCheckCount = dupCheckLine.length;
        let unqCheckCount = _.uniq(dupCheckLine).length;

        if (dupCheckCount != unqCheckCount) {
          return res.status(400).send(`More then one identical authority line detected`);
        }

        let i = 0;
        for (let line of req.body.authority_lines) {
          let codingIsValid = await questService.accountPatternIsValid(line.coding);

          if (!codingIsValid) return res.status(400).send(`Invalid account code '${line.coding}'`);

          line.s24_procure_goods_limit = line.s24_procure_goods_limit === "0" ? "" : line.s24_procure_goods_limit || "";
          line.s24_procure_services_limit =
            line.s24_procure_services_limit === "0" ? "" : line.s24_procure_services_limit || "";
          line.s24_procure_request_limit =
            line.s24_procure_request_limit === "0" ? "" : line.s24_procure_request_limit || "";
          line.s24_procure_assignment_limit =
            line.s24_procure_assignment_limit === "0" ? "" : line.s24_procure_assignment_limit || "";
          line.s23_procure_goods_limit = line.s23_procure_goods_limit === "0" ? "" : line.s23_procure_goods_limit || "";
          line.s23_procure_services_limit =
            line.s23_procure_services_limit === "0" ? "" : line.s23_procure_services_limit || "";
          line.s24_transfer_limit = line.s24_transfer_limit === "0" ? "" : line.s24_transfer_limit || "";
          line.s23_transfer_limit = line.s23_transfer_limit === "0" ? "" : line.s23_transfer_limit || "";
          line.s24_travel_limit = line.s24_travel_limit === "0" ? "" : line.s24_travel_limit || "";
          line.other_limit = line.other_limit === "0" ? "" : line.other_limit || "";
          line.loans_limit = line.loans_limit === "0" ? "" : line.loans_limit || "";
          line.s29_performance_limit = line.s29_performance_limit === "0" ? "" : line.s29_performance_limit || "";
          line.s30_payment_limit = line.s30_payment_limit === "0" ? "" : line.s30_payment_limit || "";

          //check for lines with all empty values
          let allEmpty = limitService.checkAllEmptyFormBValues(line);
          if (allEmpty)
            return res.status(400).send({ error: `Line ${line.coding} has no value in any field`, line: i });

          if (myFormA) {
            let limitError = limitService.checkFormBLineLimits(myFormA, line);

            if (limitError) return res.status(400).send({ error: limitError, line: i });
          }

          i++;
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
  loadUser,
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
      item.activation.sort((a, b) => {
        let aCompare = moment(a.date).format("YYYYMMDD");
        let bCompare = moment(b.date).format("YYYYMMDD");

        if (a.current_status == "Active") aCompare = `1${aCompare}`;
        else if (a.current_status == "Scheduled") aCompare = `2${aCompare}`;
        else aCompare = `3${aCompare}`;

        if (b.current_status == "Active") bCompare = `1${bCompare}`;
        else if (b.current_status == "Scheduled") bCompare = `2${bCompare}`;
        else bCompare = `3${bCompare}`;

        return aCompare.localeCompare(bCompare);
      });

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
