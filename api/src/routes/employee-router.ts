import express, { Request, Response } from "express";
import { RequiresData, ReturnValidationErrors } from "../middleware";
import _, { join } from "lodash";
import { DirectoryService, GenericService } from "../services";
import { Authority, Department, Employee } from "../data/models";
import { body, param } from "express-validator";
import { ObjectId } from "mongodb";
import moment from "moment";
import { checkJwt } from "../middleware/authz.middleware";

export const employeeRouter = express.Router();
employeeRouter.use(RequiresData, checkJwt);

const directoryService = new DirectoryService();

employeeRouter.get('/', async (req: Request, res: Response) => {
  //return all the authorites assigned to the account
  let db = req.store.Employees as GenericService<Employee>;

  return res.json({ data: await db.getAll({}) });
});

employeeRouter.post('/', async (req: Request, res: Response) => {
  //create a new employee
  let db = req.store.Employees as GenericService<Employee>;
  let created = await db.create(req.body);
  return res.json(created);
});

employeeRouter.post('/search',
  [body("terms").notEmpty().trim()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { terms } = req.body;

    //return all the authorites assigned to the account

    let db = req.store.Employees as GenericService<Employee>;
    let reg = new RegExp(terms, "i");

    let list = await db.getAll({
      $or: [
        { "first_name": { $regex: reg } },
        { "last_name": { $regex: reg } },
        { "ynet_id": { $regex: reg } },
      ]
    });

    //console.log("MATCHES FOR: ", terms, list.length);

    for (let item of list) {
      item.display_name = `${item.first_name} ${item.last_name}`;
      item.long_name = `${item.display_name} (${item.ynet_id}) - ${item.position}`;
    }

    return res.json({ data: list });
  });

employeeRouter.post('/search-directory',
  //[body("terms").notEmpty().trim()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { terms } = req.body;

    await directoryService.connect();
    let results = await directoryService.search(terms);

    return res.json({ data: results });
  });

employeeRouter.get('/:id',
  [param("id").notEmpty()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let empDb = req.store.Employees as GenericService<Employee>;
    let autDb = req.store.Authorities as GenericService<Authority>;

    //departments are no longer stored in the DB
    // let depDb = req.store.Departments as GenericService<Department>;

    let { id } = req.params;
    //let item = await empDb.getOne({ ynet_id: id });

    //if (item) {
    let item = { authorities: new Array<any>() };
    let authorities = await autDb.getAll({ "employee.ynet_id": id });

    if (authorities.length > 0) {
      let item = _.clone(authorities[authorities.length - 1].employee as any);
      item.authorities = authorities;

      for (let auth of item.authorities) {
        // auth.department = await depDb.getOne({ _id: new ObjectId(auth.department_id) });

        /*  if (auth.issue_date)
           auth.issue_date_display = moment(auth.issue_date).utc(false).format("YYYY-MM-DD"); */
      }
      return res.json({ data: item });
    }


    //return res.json({ data: item });
    //}

    res.status(404).send();
  });

employeeRouter.put('/:id',
  [param("id").isMongoId()], ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let empDb = req.store.Employees as GenericService<Employee>;


    let { id } = req.params;
    let { first_name, last_name, employee_id, ynet_id, primary_department } = req.body;
    let item = await empDb.getOne({ _id: new ObjectId(id) });


    if (item) {
      let update = { first_name, last_name, employee_id, ynet_id, primary_department, email: item.email };
      empDb.update(id, update);


      return res.json({ data: item });
    }

    res.status(404).send();
  });

employeeRouter.get('/:id/authorities', async (req: Request, res: Response) => {
  let { id } = req.params;
  let db = req.store.Authorities as GenericService<Authority>;
  let files = await db.getAll({ "employee_id": id });
  return res.json({ data: files });
});
