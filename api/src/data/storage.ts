import knex, { Knex } from "knex";
import { FileStore } from "../utils/file-store";
import { SqlFileStore } from "../utils/sql-file-store";
import {
  MSSQL_HOST,
  MSSQL_USER,
  MSSQL_PASSWORD,
  MSSQL_DB,
  MSSQL_PORT,
} from "../config";
import { UserService } from "../services/user-service";
import { AuthorityService } from "../services/authority-service";
import { PositionService } from "../services/position-service";
import { PositionGroupService } from "../services/position-group-service";
import { GenericService } from "../services/generic-service";
import { Employee, OperationalRestriction } from "./models";

export class Storage {
  db!: Knex;
  isInitialized: boolean = false;
  Authorities!: AuthorityService;
  Employees!: GenericService<Employee>;
  OperationalRestrictions!: GenericService<OperationalRestriction>;
  Users!: UserService;
  Files!: FileStore;
  FormA!: PositionService;
  PositionGroups!: PositionGroupService;

  constructor() {}

  async ensureConnected(): Promise<string> {
    if (this.isInitialized) return Promise.resolve("connected");

    try {
      this.db = knex({
        client: "mssql",
        connection: {
          host: MSSQL_HOST,
          port: MSSQL_PORT,
          user: MSSQL_USER,
          password: MSSQL_PASSWORD,
          database: MSSQL_DB,
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        },
      });

      // Test connection
      await this.db.raw("SELECT 1");

      this.Authorities = new AuthorityService(this.db);
      this.FormA = new PositionService(this.db);
      this.PositionGroups = new PositionGroupService(this.db);
      this.Employees = new GenericService(this.db, "employees");
      this.OperationalRestrictions = new GenericService(
        this.db,
        "operational_restrictions",
      );
      this.Users = new UserService(this.db);
      this.Files = new SqlFileStore(this.db);

      this.isInitialized = true;
      return "Connected";
    } catch (err) {
      console.error("Can't connect to MSSQL @", MSSQL_HOST);
      console.error(err);
      throw err;
    }
  }
}
