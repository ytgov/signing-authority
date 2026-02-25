import express, { Request, Response } from "express";
import { RequiresData, ReturnValidationErrors } from "../middleware";
import _, { join, sortBy } from "lodash";
import {
  ActionService,
  DirectoryService,
  GenericService,
  YesnetService,
} from "../services";
import {
  Authority,
  Department,
  Employee,
  Position,
  setAuthorityStatus,
} from "../data/models";
import { body, param } from "express-validator";
import { ObjectId } from "mongodb";
import moment from "moment";
import { checkJwt, loadUser } from "../middleware/authz.middleware";

export const employeeRouter = express.Router();
employeeRouter.use(RequiresData, checkJwt);

const directoryService = new DirectoryService();
const yesnetService = new YesnetService();

employeeRouter.get("/", async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  let db = req.store.Employees as GenericService<Employee>;

  return res.json({ data: await db.getAll({}) });
});

employeeRouter.post("/", async (req: Request, res: Response) => {
  //create a new employee
  let db = req.store.Employees as GenericService<Employee>;
  let created = await db.create(req.body);
  return res.json(created);
});

employeeRouter.post(
  "/search",
  [body("term").notEmpty().trim()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { term } = req.body;
    let db = req.store.Authorities as GenericService<Authority>;
    let reg = new RegExp(term, "i");

    let list = await db.getAll({
      $or: [
        { "employee.name": { $regex: reg } },
        { "employee.ynet_id": { $regex: reg } },
      ],
    });

    let results = new Map();

    for (let item of list) {
      setAuthorityStatus(item);

      if (results.has(item.employee.ynet_id)) {
        let rs = results.get(item.employee.ynet_id);
        rs.authority_count++;
        if (item.status == "Active") rs.active_ids.push(item._id);
      } else {
        results.set(item.employee.ynet_id, {
          display_name: item.employee.name,
          ynet_id: item.employee.ynet_id,
          authority_count: 1,
          active_ids: item.status == "Active" ? [item._id] : [],
        });
      }
    }

    return res.json({ data: Array.from(results.values()) });
  }
);

employeeRouter.post(
  "/search-directory",
  //[body("terms").notEmpty().trim()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { terms } = req.body;

    await directoryService.connect();
    await yesnetService.connect();
    let results = await directoryService.search(terms);
    let yesnetResults = await yesnetService.search(terms);

    return res.json({ data: [...results, ...yesnetResults] });
  }
);

employeeRouter.get(
  "/my-actions",
  loadUser,
  async (req: Request, res: Response) => {
    let actionService = new ActionService();
    let actions = await actionService.getActionsForUser(req.user);

    res.json({ data: actions });
  }
);

employeeRouter.get(
  "/:id",
  [param("id").notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let autDb = req.store.Authorities as GenericService<Authority>;
    let positionDb = req.store.FormA as GenericService<Position>;
    let { id } = req.params;
    let authorities = await autDb.getAll({ "employee.ynet_id": id });

    if (authorities.length > 0) {
      let item = _.clone(authorities[authorities.length - 1].employee as any);
      item.authorities = authorities;

      for (let auth of item.authorities) {
        auth.form_a = await positionDb.getById(auth.form_a_id.toString());
        setAuthorityStatus(auth);
      }
      return res.json({ data: item });
    }
    res.status(404).send();
  }
);

employeeRouter.get(
  "/email/:email",
  [param("email").notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let autDb = req.store.Authorities as GenericService<Authority>;
    let positionDb = req.store.FormA as GenericService<Position>;
    let { email } = req.params;
    let authorities = await autDb.getAll({ "employee.email": email });

    for (let auth of authorities) {
      auth.form_a = await positionDb.getById(auth.form_a_id.toString());
      setAuthorityStatus(auth);
    }

    authorities = sortBy(authorities, ["status"]);

    return res.json({ data: authorities });
  }
);

employeeRouter.put(
  "/:id",
  [param("id").isMongoId()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let empDb = req.store.Employees as GenericService<Employee>;

    let { id } = req.params;
    let { first_name, last_name, employee_id, ynet_id, primary_department } =
      req.body;
    let item = await empDb.getOne({ _id: new ObjectId(id) });

    if (item) {
      let update = {
        first_name,
        last_name,
        employee_id,
        ynet_id,
        primary_department,
        email: item.email,
      };
      empDb.update(id, update);

      return res.json({ data: item });
    }

    res.status(404).send();
  }
);

employeeRouter.get("/:id/authorities", async (req: Request, res: Response) => {
  let { id } = req.params;
  let db = req.store.Authorities as GenericService<Authority>;
  let files = await db.getAll({ employee_id: id });
  return res.json({ data: files });
});
