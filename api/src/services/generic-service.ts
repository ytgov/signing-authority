import { Knex } from "knex";
import { BaseEntity } from "../data/models";

export class GenericService<T extends BaseEntity> {
  protected db: Knex;
  protected tableName: string;

  constructor(db: Knex, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  async create(item: any): Promise<any> {
    // Remove _id/id if present (auto-generated)
    const toInsert = { ...item };
    delete toInsert._id;
    delete toInsert.id;

    const [inserted] = await this.db(this.tableName).insert(toInsert).returning("id");
    const newId = typeof inserted === "object" ? inserted.id : inserted;

    return { insertedId: newId };
  }

  async update(id: string | number, item: any): Promise<T | undefined> {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    const toUpdate = { ...item };
    delete toUpdate._id;
    delete toUpdate.id;

    try {
      await this.db(this.tableName).where({ id: numId }).update(toUpdate);
      return item as T;
    } catch (err) {
      console.log("UPDATE ERROR", err);
      return undefined;
    }
  }

  async delete(id: string | number): Promise<any> {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    return this.db(this.tableName).where({ id: numId }).del();
  }

  async getAll(query: any = {}, sort?: any): Promise<T[]> {
    let q = this.db(this.tableName).select("*");

    // Apply simple where conditions (plain object keys)
    for (const [key, value] of Object.entries(query)) {
      if (value === true || value === false) {
        q = q.where(key, value ? 1 : 0);
      } else {
        q = q.where(key, value as any);
      }
    }

    // Apply sorting
    if (sort && typeof sort === "object") {
      for (const [col, dir] of Object.entries(sort)) {
        q = q.orderBy(col, (dir as number) === 1 ? "asc" : "desc");
      }
    }

    const rows = await q;

    // Add _id alias for backward compat
    for (const row of rows) {
      if (row.id !== undefined) row._id = row.id;
    }

    return rows as T[];
  }

  async getOne(query: any = {}): Promise<T | undefined> {
    let q = this.db(this.tableName).select("*");

    for (const [key, value] of Object.entries(query)) {
      q = q.where(key, value as any);
    }

    const row = await q.first();
    if (row && row.id !== undefined) row._id = row.id;

    return row as T | undefined;
  }

  async deleteWhere(query: any = {}): Promise<any> {
    let q = this.db(this.tableName);

    for (const [key, value] of Object.entries(query)) {
      q = q.where(key, value as any);
    }

    return q.del();
  }

  async count(query: any = {}): Promise<Number> {
    let q = this.db(this.tableName);

    for (const [key, value] of Object.entries(query)) {
      q = q.where(key, value as any);
    }

    const [result] = await q.count("* as count");
    return result.count as number;
  }

  async aggregate(pipeline?: any[]): Promise<any[]> {
    // Aggregation pipelines don't directly translate to SQL.
    // For the one usage (department count with $unwind on authority_lines),
    // we handle it specifically in the route.
    console.warn("aggregate() called on GenericService - not supported in MSSQL mode");
    return [];
  }

  async getById(id: string | number): Promise<T | null> {
    try {
      const numId = typeof id === "string" ? parseInt(id, 10) : id;
      if (isNaN(numId)) return null;

      const row = await this.db(this.tableName).where({ id: numId }).first();
      if (row && row.id !== undefined) row._id = row.id;

      return (row as T) || null;
    } catch (e) {
      return null;
    }
  }
}
