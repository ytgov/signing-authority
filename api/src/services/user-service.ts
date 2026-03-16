import { Knex } from "knex";
import { User } from "../data/models";

export class UserService {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async create(user: any): Promise<any> {
    let existing = await this.db("users").where({ email: user.email }).first();
    if (existing) return undefined;

    user.create_date = new Date();

    // Extract roles and department_admin_for before inserting
    let roles = user.roles || [];
    let depts = user.department_admin_for || [];
    if (!Array.isArray(roles)) roles = [roles];
    if (!Array.isArray(depts)) depts = [depts];

    const toInsert = {
      email: user.email,
      sub: user.sub || null,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status || null,
      display_name: user.display_name || null,
      create_date: user.create_date,
    };

    const [inserted] = await this.db("users").insert(toInsert).returning("id");
    const newId = typeof inserted === "object" ? inserted.id : inserted;

    for (const role of roles) {
      if (role) await this.db("user_roles").insert({ user_id: newId, role });
    }

    for (const dept of depts) {
      if (dept) await this.db("user_department_admins").insert({ user_id: newId, department_code: dept });
    }

    return { insertedId: newId, _id: newId, id: newId };
  }

  async update(id: number, item: any) {
    // Extract roles and department_admin_for
    let roles = item.roles || [];
    let depts = item.department_admin_for || [];
    if (!Array.isArray(roles)) roles = [roles];
    if (!Array.isArray(depts)) depts = [depts];

    const toUpdate: any = {
      email: item.email,
      sub: item.sub,
      first_name: item.first_name,
      last_name: item.last_name,
      status: item.status || null,
      display_name: item.display_name || null,
    };

    // Handle explicit undefined for sub (unlinking)
    if (item.sub === undefined) {
      toUpdate.sub = null;
    }

    await this.db.transaction(async (trx) => {
      await trx("users").where({ id }).update(toUpdate);

      // Replace roles
      await trx("user_roles").where({ user_id: id }).del();
      for (const role of roles) {
        if (role) await trx("user_roles").insert({ user_id: id, role });
      }

      // Replace department admins
      await trx("user_department_admins").where({ user_id: id }).del();
      for (const dept of depts) {
        if (dept) await trx("user_department_admins").insert({ user_id: id, department_code: dept });
      }
    });

    return item;
  }

  async getAll(query: any = {}): Promise<User[]> {
    let q = this.db("users").select("*");

    // Handle MongoDB-style query patterns
    if (query.roles) {
      // e.g., { roles: "Department of Finance" }
      const role = query.roles;
      q = q.whereExists(
        this.db("user_roles")
          .whereRaw("user_roles.user_id = users.id")
          .where("role", role)
          .select(this.db.raw("1"))
      );
    } else if (query.$or) {
      // Handle $or queries (used for _id lookups)
      q = q.where((builder) => {
        for (const condition of query.$or) {
          for (const [key, value] of Object.entries(condition)) {
            if (key === "_id" || key === "id") {
              const numVal = typeof value === "number" ? value : parseInt(String(value), 10);
              if (!isNaN(numVal)) {
                builder.orWhere("id", numVal);
              }
            } else {
              builder.orWhere(key, value as any);
            }
          }
        }
      });
    } else if (query.department_admin_for) {
      const dept = query.department_admin_for;
      q = q.whereExists(
        this.db("user_department_admins")
          .whereRaw("user_department_admins.user_id = users.id")
          .where("department_code", dept)
          .select(this.db.raw("1"))
      );
    } else {
      // Simple key-value where
      for (const [key, value] of Object.entries(query)) {
        if (key === "_id" || key === "id") {
          const numVal = typeof value === "number" ? value : parseInt(String(value), 10);
          if (!isNaN(numVal)) q = q.where("id", numVal);
        } else {
          q = q.where(key, value as any);
        }
      }
    }

    const users = await q;

    // Load roles and department_admin_for for each user
    for (const user of users) {
      user._id = user.id;

      const roleRows = await this.db("user_roles").where({ user_id: user.id });
      user.roles = roleRows.map((r: any) => r.role);

      const deptRows = await this.db("user_department_admins").where({ user_id: user.id });
      user.department_admin_for = deptRows.map((d: any) => d.department_code);
    }

    return users as User[];
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.db("users").where({ email }).first();
    if (!user) return null;

    user._id = user.id;

    const roleRows = await this.db("user_roles").where({ user_id: user.id });
    user.roles = roleRows.map((r: any) => r.role);

    const deptRows = await this.db("user_department_admins").where({ user_id: user.id });
    user.department_admin_for = deptRows.map((d: any) => d.department_code);

    return user as User;
  }

  async getBySub(sub: string): Promise<User | null> {
    const user = await this.db("users").where({ sub }).first();
    if (!user) return null;

    user._id = user.id;

    const roleRows = await this.db("user_roles").where({ user_id: user.id });
    user.roles = roleRows.map((r: any) => r.role);

    const deptRows = await this.db("user_department_admins").where({ user_id: user.id });
    user.department_admin_for = deptRows.map((d: any) => d.department_code);

    return user as User;
  }

  async delete(id: string | number) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    return this.db("users").where({ id: numId }).del();
  }
}
