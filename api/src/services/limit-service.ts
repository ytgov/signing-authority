import { FormBAuthorityLine, Position, PositionAuthorityLine } from "../data/models";

export class LimitService {
  constructor() {}

  findRelevantFormALimits(dmForm: Position, line: GenericLine): PositionAuthorityLine[] {
    let coding = line.coding;
    let restricts = line.operational_restriction || undefined;
    let matches = new Array<PositionAuthorityLine>();

    for (let dmLine of dmForm.authority_lines || []) {
      // check for matching operational_restriction
      let dmRestricts = dmLine.operational_restriction || undefined;

      // if not special delegation, ignore the OR
      if (dmRestricts) {
        if (restricts != dmRestricts) continue;
      }

      if (coding == "x" && dmLine.coding == "x") matches.push(dmLine);

      let chars = dmLine.coding.split("");
      let codCh = (coding + "xxxxxxxxxxxxxxxxxxxxxx").split("");

      let hasFail = false;

      for (let i = 0; i < chars.length; ++i) {
        let dmChar = chars[i];
        let cdChar = codCh[i];

        if (dmChar == cdChar) {
          continue;
        }

        if (dmChar == "x") {
          continue;
        }

        hasFail = true;
        break;
      }

      if (!hasFail) {
        matches.push(dmLine);
      }
    }

    return matches;
  }

  checkFormALineLimits(dmForm: Position, line: PositionAuthorityLine): string | undefined {
    let limits = this.findRelevantFormALimits(dmForm, line);

    if (limits.length == 0) return `No parent rows match ${line.coding}`;

    for (let limit of limits) {
      if (!this.compareLimit(limit.contracts_for_goods_services, line.contracts_for_goods_services))
        return `${line.coding} - Contracts limit invalid`;
      if (!this.compareLimit(limit.loans_and_guarantees, line.loans_and_guarantees))
        return `${line.coding} - Loans limit invalid`;
      if (!this.compareLimit(limit.transfer_payments, line.transfer_payments))
        return `${line.coding} - Transfer limit invalid`;
      if (!this.compareLimit(limit.authorization_for_travel, line.authorization_for_travel))
        return `${line.coding} - Travel limit invalid`;
      if (!this.compareLimit(limit.request_for_goods_services, line.request_for_goods_services))
        return `${line.coding} - Request limit invalid`;
      if (!this.compareLimit(limit.assignment_authority, line.assignment_authority))
        return `${line.coding} - Assignment limit invalid`;
      if (!this.compareLimit(limit.s29_performance_limit, line.s29_performance_limit))
        return `${line.coding} - S29 Performance limit invalid`;
      if (!this.compareLimit(limit.s30_payment_limit, line.s30_payment_limit))
        return `${line.coding} - S30 Payment limit invalid`;
    }
    return undefined;
  }

  combineFormALimits(limits: PositionAuthorityLine[]): any {
    if (limits.length == 1) return limits[0];

    limits = limits.sort((a, b) => {
      if (a.coding.length == b.coding.length) return 0;
      if (a.coding.length < b.coding.length) return 1;
      return -1;
    });

    let limit = {
      coding: "",
      contracts_for_goods_services: "",
      loans_and_guarantees: "",
      transfer_payments: "",
      authorization_for_travel: "",
      request_for_goods_services: "",
      assignment_authority: "",
      s29_performance_limit: "",
      s30_payment_limit: "",
    };

    for (let lim of limits) {
      if (limit.contracts_for_goods_services == "" && lim.contracts_for_goods_services.toString() != "")
        limit.contracts_for_goods_services = lim.contracts_for_goods_services.toString();

      if (limit.loans_and_guarantees == "" && lim.loans_and_guarantees.toString() != "")
        limit.loans_and_guarantees = lim.loans_and_guarantees.toString();

      if (limit.transfer_payments == "" && lim.transfer_payments.toString() != "")
        limit.transfer_payments = lim.transfer_payments.toString();

      if (limit.authorization_for_travel == "" && lim.authorization_for_travel.toString() != "")
        limit.authorization_for_travel = lim.authorization_for_travel.toString();

      if (limit.request_for_goods_services == "" && lim.request_for_goods_services.toString() != "")
        limit.request_for_goods_services = lim.request_for_goods_services.toString();

      if (limit.assignment_authority == "" && lim.assignment_authority.toString() != "")
        limit.assignment_authority = lim.assignment_authority.toString();

      if (limit.s29_performance_limit == "" && lim.s29_performance_limit.toString() != "")
        limit.s29_performance_limit = lim.s29_performance_limit.toString();

      if (limit.s30_payment_limit == "" && lim.s30_payment_limit.toString() != "")
        limit.s30_payment_limit = lim.s30_payment_limit.toString();
    }

    return limit;
  }

  checkFormBLineLimits(formA: Position, line: FormBAuthorityLine): string | undefined {
    let limits = this.findRelevantFormALimits(formA, line);

    if (limits.length == 0) return `No parent rows match ${line.coding}`;

    let limit = this.combineFormALimits(limits);

    if (!this.compareLimit(limit.contracts_for_goods_services, line.s24_procure_goods_limit))
      return `${line.coding} - S24 Goods limit invalid`;

    if (!this.compareLimit(limit.contracts_for_goods_services, line.s23_procure_goods_limit))
      return `${line.coding} - S23 Goods limit invalid`;

    let s24ExceptionRestrictions = [
      "Special delegation S23 and S24",
      "Special delegation acquisition card purchases only",
    ];

    let s23ExceptionRestrictions = [
      "Purchase Contracts S23 only",
      "Special delegation S23",
      "Special delegation S23 and S24",
      "Special delegation acquisition card purchases only",
    ];

    if (
      line.s24_procure_goods_limit &&
      parseFloat(line.s24_procure_goods_limit + "") > 1 &&
      s24ExceptionRestrictions.indexOf(line.operational_restriction || "") < 0
    ) {
      return `${line.coding} - S24 Goods limit over $1000 w/o appropriate operational restriction`;
    }

    if (line.s23_procure_goods_limit > 1 && s23ExceptionRestrictions.indexOf(line.operational_restriction || "") < 0) {
      return `${line.coding} - S23 Goods limit over $1000 w/o appropriate operational restriction`;
    }

    if (!this.compareLimit(limit.contracts_for_goods_services, line.s24_procure_services_limit))
      return `${line.coding} - S23 Goods limit invalid`;
    if (!this.compareLimit(limit.request_for_goods_services, line.s24_procure_request_limit))
      return `${line.coding} - S24 Procure request limit invalid`;
    if (!this.compareLimit(limit.assignment_authority, line.s24_procure_assignment_limit))
      return `${line.coding} - S24 Procure assignmenty limit invalid`;
    if (!this.compareLimit(limit.contracts_for_goods_services, line.s23_procure_services_limit))
      return `${line.coding} - S23 Services limit invalid`;
    if (!this.compareLimit(limit.transfer_payments, line.s24_transfer_limit))
      return `${line.coding} - S24 Transfer limit invalid`;
    if (!this.compareLimit(limit.transfer_payments, line.s23_transfer_limit))
      return `${line.coding} - S23 Transfer limit invalid`;
    if (!this.compareLimit(limit.authorization_for_travel, line.s24_travel_limit))
      return `${line.coding} - S24 Travel limit invalid`;
    if (!this.compareLimit(limit.contracts_for_goods_services, line.other_limit))
      return `${line.coding} - Other limit invalid`;
    if (!this.compareLimit(limit.loans_and_guarantees, line.loans_limit)) return `${line.coding} - Loans limit invalid`;
    if (!this.compareLimit(limit.s29_performance_limit, line.s29_performance_limit))
      return `${line.coding} - S29 Performance limit invalid`;
    if (!this.compareLimit(limit.s30_payment_limit, line.s30_payment_limit))
      return `${line.coding} - S30 Payment limit invalid`;

    return undefined;
  }

  compareLimit(limit: any, value: any): Boolean {
    if (limit == "" && value == "") return true;
    if (value == "") return true;
    if (limit == "") return false;

    if (limit == "NL") return true;
    if (value == "NL") return false;

    let limitNum = parseFloat(limit);
    let valueNum = parseFloat(value);

    return limitNum >= valueNum;
  }

  checkValidEditsOnDM(dmForm: Position, positions: Position[]): string | undefined {
    let response = "";
    let count = 0;

    for (let pos of positions) {
      if (pos.status == "Archived") continue;
      if (pos.is_deputy_minister) continue;

      for (let line of pos.authority_lines || []) {
        let limitError = this.checkFormALineLimits(dmForm, line);

        if (limitError) {
          response += `${pos.position} : Line: ${limitError} \n`;
          count++;
        }
      }
    }

    if (count > 0) {
      return `${count} Position(s) fail validation\n ${response.trim()}`;
    } else return undefined;
  }

  checkAllEmptyFormBValues(line: any): Boolean {
    if (
      line.s24_procure_goods_limit.length == 0 &&
      line.s24_procure_services_limit.length == 0 &&
      line.s24_procure_request_limit.length == 0 &&
      line.s24_procure_assignment_limit.length == 0 &&
      line.s23_procure_goods_limit.length == 0 &&
      line.s23_procure_services_limit.length == 0 &&
      line.s24_transfer_limit.length == 0 &&
      line.s23_transfer_limit.length == 0 &&
      line.s24_travel_limit.length == 0 &&
      line.other_limit.length == 0 &&
      line.loans_limit.length == 0 &&
      line.s29_performance_limit.length == 0 &&
      line.s30_payment_limit.length == 0
    )
      return true;

    return false;
  }

  checkAllEmptyFormAValues(line: any): Boolean {
    if (
      line.contracts_for_goods_services.length == 0 &&
      line.loans_and_guarantees.length == 0 &&
      line.transfer_payments.length == 0 &&
      line.authorization_for_travel.length == 0 &&
      line.request_for_goods_services.length == 0 &&
      line.assignment_authority.length == 0 &&
      line.s29_performance_limit.length == 0 &&
      line.s30_payment_limit.length == 0
    )
      return true;

    return false;
  }
}

interface GenericLine {
  coding: string;
  operational_restriction?: string;
}
