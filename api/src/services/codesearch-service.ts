import { Authority } from "../data/models";
import { GenericService } from "./generic-service";

export class CodeSearchService {
  db: GenericService<Authority>;

  constructor(db: GenericService<Authority>) {
    this.db = db;
  }

  async search(term: string): Promise<Authority[]> {
    console.log("SEARCHING FOR ", term);

    let department_code = term.substring(0,2);

    console.log(department_code)


    return this.db.getAll({ department_code });
  }
}
