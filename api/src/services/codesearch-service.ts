import { Authority, setAuthorityStatus } from "../data/models";
import { GenericService } from "./generic-service";

export class CodeSearchService {
  db: GenericService<Authority>;

  constructor(db: GenericService<Authority>) {
    this.db = db;
  }

  async search(code: string, asAtDate: string): Promise<Authority[]> {
    console.log("SEARCHING FOR ", code, asAtDate);

    let department_code = code.substring(0, 2);

    let bigList = await this.db.getAll({ department_code });
    let littleList = new Array<Authority>();

    for (let item of bigList) {
      setAuthorityStatus(item, asAtDate);

      let foundMatch = false;

      for (let line of item.authority_lines) {
        if (codeIsChildOf(code, line.coding)) {
          foundMatch = true;
          break;
        }
      }

      if (foundMatch) littleList.push(item);
    }

    return littleList;
  }
}

function codeIsChildOf(code: string, parent: string): Boolean {
  code = code.replace(/-/g, "");
  parent = parent.replace(/-/g, "");

  let parentChars = parent.split("");
  let childChars = (code + "#######################").split("");

  for (let i = 0; i < parentChars.length; i++) {
    let pChar = parentChars[i];
    let cChar = childChars[i];

    if (pChar == cChar) continue;
    if (pChar == "x") continue;

    return false;
  }

  return true;
}
