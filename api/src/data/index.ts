import * as knex from "knex";
import { DB_CONFIG } from "../config";

export * from "./auth-user";
export * from "./migrator";
export * from "./storage";

export const db = knex.knex(DB_CONFIG);
