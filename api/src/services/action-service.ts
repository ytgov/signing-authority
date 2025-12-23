import { setAuthorityStatus } from "../data/models";
import { Storage } from "../data";

export class ActionService {
  constructor() {}

  async getActionsForUser(user: {
    email: string;
    roles: string[];
    department_admin_for: string[];
  }) {
    let roles = user.roles ?? [];
    let depts = user.department_admin_for ?? [];

    let allActions = await this.getActionsSupervisor(user.email);

    if (roles.includes("Department of Finance")) {
      let acts = await this.getActionsDepartmentOfFinance();
      allActions = [...allActions, ...acts];
    }

    if (roles.includes("Form A Administrator")) {
      let acts = await this.getActionsFormAAdmin(depts);
      allActions = [...allActions, ...acts];
    }

    if (roles.includes("Form B Administrator")) {
      let acts = await this.getActionsFormBAdmin(depts);
      allActions = [...allActions, ...acts];
    }

    return allActions;
  }

  async getActionsDepartmentOfFinance(): Promise<any[]> {
    let storage = new Storage();
    await storage.ensureConnected();
    const formAService = storage.PositionGroups;

    let awaitingA = await formAService.getAll({
      $and: [
        {
          status: {
            $nin: ["Archived", "Active", "Finance Review", "Upload Signatures"],
          },
        },
      ],
    });

    let items = new Array<any>();
    for (let item of awaitingA) {
      items.push({
        title: `Form A: ${item.status}`,
        subtitle: `${item.department_descr} - Program: ${item.program}, Activity: ${item.activity}`,
        url: `/departments/${item.department_code}/form-a/${item._id}`,
      });
    }

    const authorityService = storage.Authorities;

    let awaitingB = await authorityService.getAll({
      $and: [
        { cancel_date: { $exists: false } }, // not cancelled
        { activation: { $exists: false } }, // not yet activated
      ],
    });

    for (let item of awaitingB) {
      setAuthorityStatus(item);

      if ((item.status || "").indexOf("Draft") >= 0) continue; // these are waiting on Dept Finance
      if ((item.status || "").indexOf("Locked for Signatures") >= 0) continue; // these are not locked yet
      if ((item.status || "").indexOf("Approved") >= 0) continue; // these are not locked yet

      items.push({
        title: `Form B: ${item.status}`,
        subtitle: `${item.employee.title} - ${item.employee.name}`,
        url: `/form-b/${item._id}`,
      });
    }

    return items;
  }

  async getActionsFormAAdmin(departments: string[]): Promise<any[]> {
    let storage = new Storage();
    await storage.ensureConnected();
    const formAService = storage.PositionGroups;

    let awaiting = await formAService.getAll({
      $and: [
        { status: { $nin: ["Archived", "Active", "Finance Approve"] } }, // not cancelled
        //{ activation: { $exists: false } }, // not yet activated
        { department_code: { $in: departments } }, // a department I manage
      ],
    });

    let items = new Array<any>();
    for (let item of awaiting) {
      items.push({
        title: `Form A: ${item.status}`,
        subtitle: `${item.department_descr} - Program: ${item.program}, Activity: ${item.activity}`,
        url: `/departments/${item.department_code}/form-a/${item._id}`,
      });
    }

    return items;
  }

  async getActionsFormBAdmin(departments: string[]): Promise<any[]> {
    let storage = new Storage();
    await storage.ensureConnected();
    const authorityService = storage.Authorities;

    let awaiting = await authorityService.getAll({
      $and: [
        { cancel_date: { $exists: false } }, // not cancelled
        { activation: { $exists: false } }, // not yet activated
        { department_code: { $in: departments } }, // a department I manage
      ],
    });

    let items = new Array<any>();
    for (let item of awaiting) {
      setAuthorityStatus(item);

      if ((item.status || "").indexOf("Finance Approve") >= 0) continue; // these are waiting on Dept Finance
      if ((item.status || "").indexOf("Draft") >= 0) continue; // these are not locked yet

      items.push({
        title: `Form B: ${item.status}`,
        subtitle: `${item.employee.title} - ${item.employee.name}`,
        url: `/form-b/${item._id}`,
      });
    }

    return items;
  }

  async getActionsSupervisor(email: string): Promise<any[]> {
    let storage = new Storage();
    await storage.ensureConnected();
    const authorityService = storage.Authorities;

    let awaiting = await authorityService.getAll({
      $and: [
        { authority_type: "acting" },
        { cancel_date: { $exists: false } },
        {
          activation: {
            $elemMatch: {
              approve_user_date: null,
              reject_user_date: null,
              approve_user_email: email,
            },
          },
        },
      ],
    });

    let items = new Array<any>();
    for (let item of awaiting) {
      items.push({
        title: `Form B: Awaiting Acting Approval`,
        subtitle: `${item.employee.title} - ${item.employee.name}`,
        url: `/form-b/${item._id}`,
      });
    }

    return items;
  }
}
