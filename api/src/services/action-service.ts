import { Storage } from "../data";

export class ActionService {
  constructor() {}

  async getActionsForUser(user: { email: string; roles: string[]; department_admin_for: string[] }) {
    let storage = new Storage();
    await storage.ensureConnected();
    const authorityService = storage.Authorities;

    let roles = user.roles;
    let depts = user.department_admin_for;
    console.log(roles, depts);

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

    if (roles.includes("Acting Appointment Administrator")) {
      let acts = await this.getActionsActingAdmin(depts);
      allActions = [...allActions, ...acts];
    }

    return allActions;
  }

  async getActionsDepartmentOfFinance(): Promise<any[]> {
    return [{ title: "Form A: Finance Review", subtitle: "LEGISLATIVE ASSEMBLY" }];
  }

  async getActionsFormAAdmin(departments: string[]): Promise<any[]> {
    return [{ title: "Form A: Upload Signatures", subtitle: "ECONOMIC DEVELOPMENT" }];
  }

  async getActionsFormBAdmin(departments: string[]): Promise<any[]> {
    return [{ title: "Form B: Upload Signatures", subtitle: "Johanna Smith" }];
  }

  async getActionsActingAdmin(departments: string[]): Promise<any[]> {
    //return [{ title: "Form B Ready - Awaiting Acting " }];
    return [];
  }

  async getActionsSupervisor(email: string): Promise<any[]> {
    return [{ title: "Form B: Awaiting Acting Approval", subtitle: "Gritt Hoffmann" }];
  }
}
