import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import moment from "moment";
import _ from "lodash";
import fs from "fs";
import { generatePDF } from "../utils/pdf-generator";
import { ReturnValidationErrors } from "../middleware";
import { EmailService, GenericService, LimitService, QuestService, UserService } from "../services";

import {
  Authority,
  Position,
  OperationalRestrictions,
  PositionGroup,
  StoredFile,
  User,
  setAuthorityStatus,
  setPositionStatus,
  ReviewResultType,
  PositionAuthorityLine,
} from "../data/models";
import { ObjectId } from "mongodb";

import { ExpressHandlebars } from "express-handlebars";
export const formARouter = express.Router();

import { checkJwt, loadUser, isFormAAdmin, isSystemAdmin } from "../middleware/authz.middleware";
import { CleanFilename, FormatCoding } from "../utils/formatters";
import { FileStore } from "../utils/file-store";
import { API_PORT } from "../config";

// formARouter.use('/uploads', uploadsRouter)

const questService = new QuestService();
const emailService = new EmailService();
const limitService = new LimitService();

formARouter.get("/operational-restrictions", (req: Request, res: Response) => {
  return res.json(OperationalRestrictions);
});

formARouter.get("/", checkJwt, loadUser, isSystemAdmin, async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let list = await db.getAll({});

  for (let position of list) {
    setPositionStatus(position);
  }

  res.json({ data: list });
});

formARouter.get("/pending-groups", checkJwt, loadUser, isSystemAdmin, async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let groupDb = req.store.PositionGroups as GenericService<PositionGroup>;

  let list = await groupDb.getAll({});

  for (let item of list) {
    item.create_date_display = moment(item.create_date).utc(true).format("MMMM D, YYYY @ h:mm a");

    if (item.activated_positions) item.positions = item.activated_positions;
    else item.positions = await db.getAll({ position_group_id: item._id });

    item.positions.sort((a, b) => (a.position_group_order || 1000) - (b.position_group_order || 1000));

    for (let position of item.positions) {
      setPositionStatus(position);
    }
  }

  return res.json({ data: list });
});

formARouter.put(
  "/pending-groups/:id/status",
  checkJwt,
  loadUser,
  isSystemAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    let groupDb = req.store.PositionGroups as GenericService<PositionGroup>;
    let existing = await groupDb.getById(id);

    if (existing) {
      existing.status = status;
      await groupDb.update(id, existing);
    }

    return res.json({ data: "success" });
  }
);

formARouter.post("/auto-archive", checkJwt, loadUser, isSystemAdmin, async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let groupDb = req.store.PositionGroups as GenericService<PositionGroup>;
  let allGroups = await groupDb.getAll({ status: { $ne: "Archived" } });

  let archiveList = [];

  for (let group of allGroups) {
    let groupPositions = await db.getAll({ position_group_id: group._id });

    if (groupPositions.length == 0) {
      if (group._id) {
        group.status = "Archived";
        archiveList.push(group);
        await groupDb.update(group._id.toString(), group);
      }
    }
  }

  return res.json({ data: archiveList });
});

formARouter.get("/temp-pdf-preview", async (req: Request, res: Response) => {
  const ids = req.query.ids as string;
  const { department_code, department_descr, program, activity } = req.query;

  let db = req.store.FormA as GenericService<Position>;
  let positions = new Array<Position>();

  for (let id of ids.split(",")) {
    let p = await db.getById(id);
    if (p) positions.push(p);
  }

  let item = {
    department_code,
    department_descr,
    create_date: new Date(),
    created_by: "",
    created_by_id: ObjectId.createFromTime(123),
    status: "Preview",
    program,
    activity,
  } as PositionGroup;

  let lines = new Array();

  for (let position of positions) {
    let title = position.position;
    let lineList = position.authority_lines || [];

    for (let line of lineList) {
      lines.push({
        position: title,
        coding: line.coding,
        coding_display: FormatCoding(line.coding),
        operational_restriction: line.operational_restriction,
        contracts_for_goods_services: line.contracts_for_goods_services,
        loans_and_guarantees: line.loans_and_guarantees,
        transfer_payments: line.transfer_payments,
        authorization_for_travel: line.authorization_for_travel,
        request_for_goods_services: line.request_for_goods_services,
        assignment_authority: line.assignment_authority,
        s29_performance_limit: line.s29_performance_limit,
        s30_payment_limit: line.s30_payment_limit,
      });
    }

    item.authority_lines = lines;
  }

  const PDF_TEMPLATE = fs.readFileSync(__dirname + "/../templates/pdf/FormATemplate.html");

  (item as any).API_PORT = API_PORT;

  let t = new ExpressHandlebars();
  const template = t.handlebars.compile(PDF_TEMPLATE.toString(), {});
  let data = template(item);

  let dept = CleanFilename(`${department_code}`);
  if (program) dept = `${dept}-${CleanFilename(`${program}`)}`;
  if (activity) dept = `${dept}-${CleanFilename(`${activity}`)}`;

  let pdf = await generatePDF(data);
  res.setHeader("Content-disposition", `attachment; filename="FormA_${dept}.pdf"`);
  res.setHeader("Content-type", "application/pdf");
  res.send(pdf);
});

formARouter.get(
  "/:id",
  [param("id").isMongoId().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let item = await loadSinglePosition(req, id);

    if (item && item._id) {
      setPositionStatus(item);

      /* 
      if (item.deactivation) item.status = "Archived";
      else if (item.activation) {
        item.status = "Active";
      } else item.status = "Inactive (Draft)"; */

      let db = req.store.Authorities as GenericService<Authority>;
      let connectedAuthorizations = await db.getAll({
        form_a_id: item._id.toString(),
      });

      for (let conn of connectedAuthorizations) {
        setAuthorityStatus(conn);
      }

      item.active_authorities = connectedAuthorizations; //.filter((f) => f.activation);

      return res.json({ data: item });
    }

    res.status(404).send();
  }
);

formARouter.get("/department/:department", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let department_code = req.params.department;

  let list = await db.getAll(
    { department_code: department_code /* deactivation: { $eq: null } */ },
    { program_branch: 1, activity: 1, position: 1 }
  );

  if (list) {
    for (let item of list) {
      setPositionStatus(item);

      if (item.activity) item.program_activity = `${item.program_branch} : ${item.activity}`;
      else item.program_activity = item.program_branch;
    }

    return res.json({ data: list });
  }

  res.status(404).send();
});

formARouter.post("/department/:department_code", checkJwt, loadUser, async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let groupDb = req.store.PositionGroups as GenericService<PositionGroup>;
  let userDb = req.store.Users as UserService;
  let { program, activity, items, department_descr } = req.body;
  let { department_code } = req.params;

  let group: PositionGroup = {
    create_date: new Date(),
    created_by: `${req.user.first_name} ${req.user.last_name}`,
    created_by_id: req.user._id,
    department_code,
    department_descr,
    status: "Finance Review",
    program: program || "",
    activity: activity || "",
  };

  let result = await groupDb.create(group);
  if (result.insertedId) {
    group._id = result.insertedId;

    let emailUsers = await userDb.getAll({ roles: "Department of Finance" });
    await emailService.sendFormAFinReview(group, emailUsers, "Form A Finance Review", group.created_by);

    let order = 1;
    for (let item of items) {
      let position = await db.getById(item);

      if (position) {
        position.position_group_id = result.insertedId;
        position.position_group_order = order;

        if (position.status != "Active") {
          position.audit_lines?.push({
            date: new Date(),
            user_name: `${req.user.first_name} ${req.user.last_name}`,
            action: "Locked",
            previous_value: {},
          });
        }

        order++;
        await db.update(item, position);
      }
    }

    // find groups to archive if they are empty
    let allGroups = await groupDb.getAll({ department_code, status: { $ne: "Archived" } });

    for (let group of allGroups) {
      let groupPositions = await db.getAll({ position_group_id: group._id });

      if (groupPositions.length == 0) {
        if (group._id) {
          group.status = "Archived";
          await groupDb.update(group._id.toString(), group);
        }
      }
    }
  }

  return res.json({ data: result.insertedId });
});

formARouter.get("/department/:department_code/pending-groups", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let { department_code } = req.params;
  let groupDb = req.store.PositionGroups as GenericService<PositionGroup>;

  let list = await groupDb.getAll({ department_code });

  for (let item of list) {
    item.create_date_display = moment(item.create_date).utc(true).format("MMMM D, YYYY @ h:mm a");

    if (item.activated_positions) item.positions = item.activated_positions;
    else item.positions = await db.getAll({ position_group_id: item._id });

    item.positions.sort((a, b) => (a.position_group_order || 1000) - (b.position_group_order || 1000));

    for (let position of item.positions) {
      setPositionStatus(position);
    }
  }

  return res.json({ data: list });
});

formARouter.delete(
  "/department/:department_code/pending-groups/:id",
  checkJwt,
  loadUser,
  isFormAAdmin,
  async (req: Request, res: Response) => {
    let db = req.store.FormA as GenericService<Position>;
    let { department_code, id } = req.params;
    let groupDb = req.store.PositionGroups as GenericService<PositionGroup>;

    let item = await groupDb.getById(id);

    if (item) {
      let positions = await db.getAll({ position_group_id: item._id });

      for (let position of positions) {
        let posId = position._id?.toString() || "";
        position.position_group_id = undefined;

        position.audit_lines?.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Unlocked",
          previous_value: {},
        });

        await db.update(posId, position);
      }

      await groupDb.delete(id);
    }

    return res.json({});
  }
);

formARouter.put(
  "/department/:department_code/pending-groups/:id",
  checkJwt,
  loadUser,
  isFormAAdmin,
  async (req: Request, res: Response) => {
    let db = req.store.FormA as GenericService<Position>;
    let { department_code, id } = req.params;
    let { save_action, comments, status } = req.body;
    let groupDb = req.store.PositionGroups as GenericService<PositionGroup>;
    let userDb = req.store.Users as UserService;
    let fileStore = req.store.Files as FileStore;

    let item = await groupDb.getById(id);

    if (item) {
      if (save_action == "FinanceApproveApprove") {
        item.status = "Active";
        item.finance_approval_complete = {
          id: req.user._id,
          name: `${req.user.first_name} ${req.user.last_name}`,
          date: new Date(),
          comments,
        };

        let positions = await db.getAll({ position_group_id: item._id });

        if (item.upload_signatures) {
          for (let position of positions) {
            //position.position_group_id = undefined; removed becuase this caused too much auto-archive

            position.activation = {
              activate_user_id: req.user._id,
              //approver_name: item.upload_signatures.deputy_minister_name,
              //recommender_name: item.upload_signatures.department_administrator_name,
              date: new Date(),
              file_id: item.upload_signatures.file_id,
            };

            position.audit_lines?.push({
              date: new Date(),
              user_name: `${req.user.first_name} ${req.user.last_name}`,
              action: "Activated",
              previous_value: {},
            });

            let posId = (position._id || "").toString();
            await db.update(posId, position);
          }
        }

        item.activated_positions = positions.map((p) => {
          return {
            _id: p._id,
            position: p.position,
            program_branch: p.program_branch,
            activity: p.activity,
            authority_lines: p.authority_lines,
            deactivation: p.deactivation,
            activation: p.activation,
            position_group_id: p.position_group_id,
            position_group_order: p.position_group_order,
          };
        });

        let creator: User[];

        if (item.created_by_id) creator = await userDb.getAll({ _id: item.created_by_id });
        else {
          let allUsers = await userDb.getAll();
          creator = allUsers.filter((u) => `${u.first_name} ${u.last_name}` == item?.created_by);
        }

        await emailService.sendFormAApproveApprove(
          item,
          creator[0],
          "Form A Activation",
          `${req.user.first_name} ${req.user.last_name}`
        );

        delete item._id;
        await groupDb.update(id, item);
      } else if (save_action == "FinanceApproveReject") {
        item.status = "Rejected";
        item.finance_approval_reject = {
          id: req.user._id,
          name: `${req.user.first_name} ${req.user.last_name}`,
          date: new Date(),
          comments,
        };

        let creator: User[];

        if (item.created_by_id) creator = await userDb.getAll({ _id: item.created_by_id });
        else {
          let allUsers = await userDb.getAll();
          creator = allUsers.filter((u) => `${u.first_name} ${u.last_name}` == item?.created_by);
        }

        await emailService.sendFormAApproveReject(
          item,
          creator[0],
          "Finance Approve Rejected",
          `${req.user.first_name} ${req.user.last_name}`,
          `<br><span style="color:red; font-weight:bold">Rejection Comment: ${comments}</span>`
        );

        delete item._id;
        groupDb.update(id, item);
      } else if (save_action == "FinanceReviewApprove") {
        item.status = "Upload Signatures";
        item.finance_review_complete = {
          id: req.user._id,
          name: `${req.user.first_name} ${req.user.last_name}`,
          date: new Date(),
          comments,
        };

        let creator: User[];

        if (item.created_by_id) creator = await userDb.getAll({ _id: item.created_by_id });
        else {
          let allUsers = await userDb.getAll();
          creator = allUsers.filter((u) => `${u.first_name} ${u.last_name}` == item?.created_by);
        }

        await emailService.sendFormAReviewApprove(
          item,
          creator[0],
          "Upload Signatures",
          `${req.user.first_name} ${req.user.last_name}`
        );

        delete item._id;
        groupDb.update(id, item);
      } else if (save_action == "FinanceReviewReject") {
        item.status = "Rejected";
        item.finance_review_reject = {
          id: req.user._id,
          name: `${req.user.first_name} ${req.user.last_name}`,
          date: new Date(),
          comments,
        };

        item.upload_signatures = undefined;

        let creator: User[];

        if (item.created_by_id) creator = await userDb.getAll({ _id: item.created_by_id });
        else {
          let allUsers = await userDb.getAll();
          creator = allUsers.filter((u) => `${u.first_name} ${u.last_name}` == item?.created_by);
        }

        await emailService.sendFormAReviewReject(
          item,
          creator[0],
          "Finance Review Rejected",
          `${req.user.first_name} ${req.user.last_name}`,
          `<br><span style="color:red; font-weight:bold">Rejection Reason: ${comments}</span>`
        );

        delete item._id;
        groupDb.update(id, item);
      } else if (save_action == "UploadSignatures") {
        item.status = "Finance Approve";

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
            item.upload_signatures = {
              id: req.user._id,
              name: `${req.user.first_name} ${req.user.last_name}`,
              date: new Date(),
              //department_administrator_name: req.body.department_administrator_name,
              //deputy_minister_name: req.body.deputy_minister_name,
              file_id: fileInfo._id,
            };

            let emailUsers = await userDb.getAll({ roles: "Department of Finance" });

            await emailService.sendFormAUpload(
              item,
              emailUsers,
              "Finance Approve",
              `${req.user.first_name} ${req.user.last_name}`
            );

            delete item._id;
            await groupDb.update(id, item);
          }
        }
      } else if (save_action == "Reset") {
        item.upload_signatures = undefined;
        item.finance_approval_complete = undefined;
        item.finance_approval_reject = undefined;
        //item.finance_review_complete = undefined;
        //item.finance_review_reject = undefined;
        item.status = "Upload Signatures";

        await groupDb.update(id, item);
      } else {
        if (status == "Archived") {
          if (item.activated_positions) {
            for (let position of item.activated_positions) {
              let pos = await db.getById(position._id);

              if (pos) {
                setPositionStatus(pos);

                if (pos.status == "Active") {
                  return res.status(400).send(`You cannot archive a Form A with Active positions.`);
                }
              }
            }
          }

          //item.status = status;

          //await groupDb.update(id, item);
        } else {
          item.status = status;

          await groupDb.update(id, item);
        }
      }
    }

    return res.json({});
  }
);

formARouter.get("/department/:department/pending-positions", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let department_code = req.params.department;

  let list = await db.getAll({ department_code: department_code }, { program_branch: 1, activity: 1, position: 1 });

  if (list) {
    for (let item of list) {
      if (item.deactivation) item.status = "Archived";
      else if (item.activation) {
        item.status = "Active";
      } else item.status = "Inactive (Draft)";

      if (item.activity) item.program_activity = `${item.program_branch} : ${item.activity}`;
      else item.program_activity = item.program_branch;
    }

    return res.json({ data: list });
  }

  res.status(404).send();
});

formARouter.get("/department/:department/program", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let department_code = req.params.department;

  let list = await db.getAll({ department_code: department_code, deactivation: { $eq: null } }, { program_branch: 1 });
  let programs = list.map((d) => d.program_branch);
  programs = _.uniq(programs);

  res.json({ data: programs });
});

formARouter.get("/department/:department/activity", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let department_code = req.params.department;

  let list = await db.getAll(
    {
      department_code: department_code,
      activity: { $ne: null },
      deactivation: { $eq: null },
    },
    { activity: 1 }
  );
  let activities = list.map((d) => d.activity);
  activities = _.uniq(activities);

  res.json({ data: activities });
});

formARouter.get("/department/:department/program/:program_branch/activity", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let department_code = req.params.department;
  let { program_branch } = req.params;

  let list = await db.getAll(
    {
      department_code: department_code,
      program_branch,
      activity: { $ne: null },
    },
    { activity: 1 }
  );
  let activities = list.map((d) => d.activity);
  activities = _.uniq(activities);

  res.json({ data: activities });
});

formARouter.post("/department/:department/branch", checkJwt, loadUser, async (req: Request, res: Response) => {
  //Return a list of FormA positions for a branch which is send in the body of a POST request
  let db = req.store.FormA as GenericService<Position>;
  let department_code = req.params.department;

  let program_branch = req.body.program_branch;

  let list = await db.getAll({ department_code: department_code, program_branch: program_branch }, { position: 1 });

  if (list) {
    for (let item of list) {
      if (item.deactivation) item.status = "Archived";
      else if (item.activation) {
        item.status = "Active";
      } else item.status = "Inactive (Draft)";
    }

    return res.json({ data: list });
  }

  res.status(404).send();
});

formARouter.post("/department/:department/validate-line", async (req: Request, res: Response) => {
  let { authority_line } = req.body;
  let val = await questService.accountPatternIsValid(authority_line.coding);
  res.send(val);
});

formARouter.get("/department/:department/count", async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;
  let department_code = req.params.department;
  // console.log (`Asking for a count of dept ${department_code}`)
  let pipeline = [
    { $match: { department_code: department_code } },
    { $unwind: "$authority_lines" },
    // {$match: {}},
    {
      $group: {
        _id: {
          department_code: "$department_code",
          department_descr: "$department_descr",
        },
        position_count: { $sum: 1 },
      },
    },
  ];
  let count = await db.aggregate(pipeline);
  // let count = await db.count({"department_code": department_code})
  if (count.length == 1) return res.json(count[0]);
  res.status(404).send();
});

formARouter.get(
  "/:id/pdf",
  [param("id").isMongoId().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    let db = req.store.FormA as GenericService<Position>;
    let groupDb = req.store.PositionGroups as GenericService<PositionGroup>;

    let item = await groupDb.getById(id);

    if (item) {
      item.positions = await db.getAll({ position_group_id: item._id });
      item.positions.sort((a, b) => (a.position_group_order || 1000) - (b.position_group_order || 1000));

      let lines = new Array();

      for (let position of item.positions) {
        let title = position.position;
        let lineList = position.authority_lines || [];

        for (let line of lineList) {
          lines.push({
            position: title,
            coding: line.coding,
            coding_display: FormatCoding(line.coding),
            operational_restriction: line.operational_restriction,
            contracts_for_goods_services: line.contracts_for_goods_services,
            loans_and_guarantees: line.loans_and_guarantees,
            transfer_payments: line.transfer_payments,
            authorization_for_travel: line.authorization_for_travel,
            request_for_goods_services: line.request_for_goods_services,
            assignment_authority: line.assignment_authority,
            s29_performance_limit: line.s29_performance_limit,
            s30_payment_limit: line.s30_payment_limit,
          });
        }
      }

      item.authority_lines = lines;

      const PDF_TEMPLATE = fs.readFileSync(__dirname + "/../templates/pdf/FormATemplate.html");

      (item as any).API_PORT = API_PORT;

      let t = new ExpressHandlebars();
      const template = t.handlebars.compile(PDF_TEMPLATE.toString(), {});
      let data = template(item);

      let dept = CleanFilename(`${item.department_code}`);
      if (item.program) dept = `${dept}-${CleanFilename(`${item.program}`)}`;
      if (item.activity) dept = `${dept}-${CleanFilename(`${item.activity}`)}`;

      let pdf = await generatePDF(data);
      res.setHeader("Content-disposition", `attachment; filename="FormA_${dept}.pdf"`);
      res.setHeader("Content-type", "application/pdf");
      res.send(pdf);
    }

    res.status(404).send();
  }
);

formARouter.delete(
  "/:id",
  checkJwt,
  loadUser,
  isFormAAdmin,
  [param("id").notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let db = req.store.FormA as GenericService<Position>;

    db.delete(id);
    res.send("");
  }
);

formARouter.post(
  "/:id/dm-validate",
  checkJwt,
  loadUser,
  isFormAAdmin,
  [param("id").isMongoId().notEmpty(), body("program_branch").trim(), body("activity").trim()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let db = req.store.FormA as GenericService<Position>;

    let existing = await db.getById(id);

    if (existing) {
      let deptPositions = await db.getAll({
        department_code: existing?.department_code,
        _id: { $ne: new ObjectId(id) },
      });

      for (let pos of deptPositions) {
        setPositionStatus(pos);
      }

      let limitError = limitService.checkValidEditsOnDM(existing, deptPositions);

      if (limitError) return res.status(400).send(limitError);

      return res.json({ data: "Successfully validated " + existing?.position });
    }

    res.status(404).send();
  }
);

formARouter.put(
  "/:id/position_group_id",
  checkJwt,
  loadUser,
  isSystemAdmin,
  [param("id").isMongoId().notEmpty(), body("program_branch").trim(), body("activity").trim()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { position_group_id } = req.body;
    let db = req.store.FormA as GenericService<Position>;

    let existing = await db.getById(id);

    if (existing) {
      existing.position_group_id = position_group_id;

      await db.update(id, existing);
      return res.json({ data: "success" });
    }

    res.status(404).send();
  }
);

formARouter.put(
  "/:id",
  checkJwt,
  loadUser,
  isFormAAdmin,
  [param("id").isMongoId().notEmpty(), body("program_branch").trim(), body("activity").trim()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let db = req.store.FormA as GenericService<Position>;
    let userDb = req.store.Users as UserService;

    req.body.updated_on = new Date();
    req.body.updated_by = req.user.email;

    let existing = await db.getById(id);

    if (existing) delete existing.audit_lines;

    if (req.body.activity && req.body.activity.length == 0) delete req.body.activity;

    let saveAction = req.body.save_action;
    delete req.body.save_action;

    if (saveAction) {
      if (saveAction == "DMLock") {
        let deptPositions = await db.getAll({
          department_code: existing?.department_code,
          _id: { $ne: new ObjectId(id) },
        });

        for (let pos of deptPositions) {
          setPositionStatus(pos);
        }

        let limitError = limitService.checkValidEditsOnDM(req.body, deptPositions);

        if (limitError) return res.status(400).send(limitError);

        req.body.audit_lines.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Locked for Approval",
          previous_value: existing,
        });

        let emailUsers = await userDb.getAll({ roles: "Department of Finance" });
        if (existing) await emailService.sendDMNotification(existing, emailUsers);

        req.body.position_group_id = "-1";
      } else if (saveAction == "DMApprove") {
        let deptPositions = await db.getAll({
          department_code: existing?.department_code,
          _id: { $ne: new ObjectId(id) },
        });

        for (let pos of deptPositions) {
          setPositionStatus(pos);
        }

        let limitError = limitService.checkValidEditsOnDM(req.body, deptPositions);

        if (limitError) return res.status(400).send(limitError);

        let authorityDb = req.store.Authorities as GenericService<Authority>;

        let newFormB: Authority = {
          department_code: req.body.department_code,
          department_descr: req.body.department_descr,
          authority_type: "substantive",
          employee: req.body.employee,
          supervisor: { title: "", name: "", email: "", ynet_id: "", upn: "" },
          program_branch: "ALL",
          form_a_id: new ObjectId(id),
          authority_lines: [],
          create_date: new Date(),
          created_by_id: req.user._id,
          created_by_name: "",
          audit_lines: [],
        };
        (newFormB as any).created_by = `${req.user.first_name} ${req.user.last_name}`;

        for (let line of req.body.authority_lines) {
          let useOne = line.contracts_for_goods_services != "" ? "1" : "";

          (newFormB.authority_lines as any[]).push({
            coding: line.coding,
            operational_restriction: line.operational_restriction,
            s24_procure_goods_limit: useOne,
            s24_procure_services_limit: line.contracts_for_goods_services,
            s24_procure_request_limit: line.request_for_goods_services,
            s24_procure_assignment_limit: line.assignment_authority,
            s23_procure_goods_limit: useOne,
            s23_procure_services_limit: line.contracts_for_goods_services,
            s24_transfer_limit: line.transfer_payments,
            s23_transfer_limit: line.transfer_payments,
            s24_travel_limit: line.authorization_for_travel,
            other_limit: line.contracts_for_goods_services,
            loans_limit: line.loans_and_guarantees,
            s29_performance_limit: line.s29_performance_limit,
            s30_payment_limit: line.s30_payment_limit,
          });
        }

        newFormB.audit_lines?.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Form B auto-created",
          previous_value: {},
        });

        newFormB.department_reviews = [
          {
            user_id: req.user._id,
            name: `${req.user.first_name} ${req.user.last_name}`,
            date: new Date(),
            note: "",
            result: ReviewResultType.Approved,
          },
        ];

        newFormB.audit_lines?.push({
          action: "Locked for Signatures",
          date: new Date(),
          previous_value: {},
          user_name: `${req.user.first_name} ${req.user.last_name}`,
        });

        await authorityDb.create(newFormB);

        /* removed per JS
        let deptFBAdmins = await userDb.getAll({
          roles: "Form B Administrator",
          department_admin_for: req.body.department_code,
        });

        if (deptFBAdmins) {
          let newFormBObj = await authorityDb.getById(createdFormB.insertedId.toString());
          if (newFormBObj)
            await emailService.sendFormBUpload(
              newFormBObj,
              deptFBAdmins,
              "Upload Signatures",
              `${req.user.first_name} ${req.user.last_name}`,
              "Updated Deputy Minister or Equivant - High Priority"
            );
        }
        */

        req.body.audit_lines.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Approved & Activated",
          previous_value: existing,
        });

        req.body.activation = {
          activate_user_id: req.user._id,
          date: new Date(),
          file_id: null,
        };

        if (existing) {
          let creator = await userDb.getAll({ email: req.body.updated_by });
          await emailService.sendDMApproved(existing, creator[0]);
        }

        let oldDMList = await db.getAll({ department_code: req.body.department_code, is_deputy_minister: true });

        for (let oldDM of oldDMList) {
          if (oldDM._id?.toString() == id) continue;

          oldDM.is_deputy_minister = false;

          if (!oldDM.deactivation) {
            oldDM.deactivation = {
              reason: "DM Authority Update",
              date: new Date(),
              by: `${req.user.first_name} ${req.user.last_name}`,
              sub: req.user.sub,
            };

            if (oldDM.audit_lines) {
              oldDM.audit_lines.push({
                date: new Date(),
                user_name: `${req.user.first_name} ${req.user.last_name}`,
                action: "Archived",
                previous_value: {},
              });
            }
          }

          await db.update((oldDM._id || "").toString(), oldDM);
        }

        req.body.is_deputy_minister = true;
        req.body.is_deputy_duplicate = false;

        await db.update(id, req.body);

        let item = await loadSinglePosition(req, id);
        return res.json({ data: item });
      } else if (saveAction == "DMReject") {
        req.body.audit_lines.push({
          date: new Date(),
          user_name: `${req.user.first_name} ${req.user.last_name}`,
          action: "Rejected",
          previous_value: existing,
        });

        if (existing) {
          let creator = await userDb.getAll({ email: req.body.updated_by });
          await emailService.sendDMRejected(existing, creator[0], req.body.comments);
        }

        delete req.body.comments;
        delete req.body.activation;
        req.body.position_group_id = undefined;
      }

      await db.update(id, req.body);

      let item = await loadSinglePosition(req, id);
      return res.json({ data: item });
    }

    // If archiving a form note the details
    if (req.query.archive == "true") {
      if (!req.body.deactivation) req.body.deactivation = {};
      req.body.deactivation.by = req.user.email;
      req.body.deactivation.sub = req.user.sub;
      req.body.deactivation.date = new Date();

      req.body.audit_lines.push({
        date: new Date(),
        user_name: `${req.user.first_name} ${req.user.last_name}`,
        action: "Archived",
        previous_value: existing,
      });
    } else {
      req.body.audit_lines.push({
        date: new Date(),
        user_name: `${req.user.first_name} ${req.user.last_name}`,
        action: "Update",
        previous_value: existing,
      });
    }

    let skipLimitChecks = false;

    if (existing && (existing.is_deputy_minister || existing.is_deputy_duplicate)) skipLimitChecks = true;

    let myDMForms = await db.getAll({
      department_code: req.body.department_code,
      is_deputy_minister: true,
      activation: { $ne: null },
    });

    if (myDMForms.length == 0 && !skipLimitChecks) {
      return res.status(500).send("Cannot find any DM for this department");
    } else if (myDMForms.length > 1 && !skipLimitChecks) {
      return res.status(500).send("Found multiple DM for this department");
    }

    let myDMForm = myDMForms[0];

    //RA: this should be the ID of the person creating the FormA I think
    if (req.body.employee_id) req.body.employee_id = new ObjectId(req.body.employee_id);
    // console.log(req.body.authority_lines[0])

    // check for duplicate coding/OR
    let dupCheckLine = req.body.authority_lines.map(
      (l: PositionAuthorityLine) => `${l.coding}#${l.operational_restriction || ""}`
    );

    let dupCheckCount = dupCheckLine.length;
    let unqCheckCount = _.uniq(dupCheckLine).length;

    if (dupCheckCount != unqCheckCount) {
      return res.status(400).send(`More then one identical authority line detected`);
    }

    for (let line of req.body.authority_lines) {
      let codingIsValid = await questService.accountPatternIsValid(line.coding);

      if (!codingIsValid) return res.status(400).send(`Invalid account code '${line.coding}'`);

      line.contracts_for_goods_services =
        line.contracts_for_goods_services === "0" ? "" : line.contracts_for_goods_services || "";
      line.loans_and_guarantees = line.loans_and_guarantees === "0" ? "" : line.loans_and_guarantees || "";
      line.transfer_payments = line.transfer_payments === "0" ? "" : line.transfer_payments || "";
      line.authorization_for_travel = line.authorization_for_travel === "0" ? "" : line.authorization_for_travel || "";
      line.request_for_goods_services =
        line.request_for_goods_services === "0" ? "" : line.request_for_goods_services || "";
      line.assignment_authority = line.assignment_authority === "0" ? "" : line.assignment_authority || "";
      line.s29_performance_limit = line.s29_performance_limit === "0" ? "" : line.s29_performance_limit || "";
      line.s30_payment_limit = line.s30_payment_limit === "0" ? "" : line.s30_payment_limit || "";

      //check for lines with all empty values
      let allEmpty = limitService.checkAllEmptyFormAValues(line);
      if (allEmpty) return res.status(400).send(`Line ${line.coding} has no value in any field`);

      if (!skipLimitChecks) {
        let limitError = limitService.checkFormALineLimits(myDMForm, line);

        if (limitError) return res.status(400).send(limitError);
      }
    }

    await db.update(id, req.body);

    let item = await loadSinglePosition(req, id);
    res.json({ data: item });
  }
);

formARouter.post("/", checkJwt, loadUser, async (req: Request, res: Response) => {
  let db = req.store.FormA as GenericService<Position>;

  req.body.created_on = new Date();
  req.body.created_by = req.user.email;

  req.body.audit_lines = [
    {
      date: new Date(),
      user_name: `${req.user.first_name} ${req.user.last_name}`,
      action: "Position created",
    },
  ];

  let created = await db.create(req.body);
  let item = await loadSinglePosition(req, created.insertedId.toString());
  res.json({ data: item });
});

async function loadSinglePosition(req: Request, id: string): Promise<Position | null> {
  let db = req.store.FormA as GenericService<Position>;

  let item = await db.getById(id);

  if (!item) return null;

  setPositionStatus(item);

  if (item.activation && item.activation.date)
    item.issue_date_display = moment(item.activation.date).format("YYYY-MM-DD");

  if (!item.audit_lines) item.audit_lines = [];

  for (let audit of item.audit_lines) {
    audit.date_display = moment(audit.date).format("YYYY-MM-DD @ h:mm a");
  }

  if (item.authority_lines) {
    for (let line of item.authority_lines) {
      line.coding_display = FormatCoding(line.coding);
    }
  }

  return item;
}
