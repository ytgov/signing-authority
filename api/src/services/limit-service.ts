import { FormBAuthorityLine, Position, PositionAuthorityLine } from "../data/models";

export class LimitService {
  constructor() {}

  async findRelevantLimit(coding: string): Promise<PositionAuthorityLine> {
    return {
      coding: "",
      contracts_for_goods_services: 100,
      loans_and_guarantees: 100,
      transfer_payments: 100,
      authorization_for_travel: 100,
      request_for_goods_services: 100,
      assignment_authority: 100,
      s29_performance_limit: 100,
      s30_payment_limit: 100,
    };
  }

  async checkFormALineLimits(line: PositionAuthorityLine): Promise<Boolean> {
    let limit = await this.findRelevantLimit(line.coding);

    if (!this.compareLimit(limit.contracts_for_goods_services, line.contracts_for_goods_services)) return false;
    if (!this.compareLimit(limit.loans_and_guarantees, line.loans_and_guarantees)) return false;
    if (!this.compareLimit(limit.transfer_payments, line.transfer_payments)) return false;
    if (!this.compareLimit(limit.authorization_for_travel, line.authorization_for_travel)) return false;
    if (!this.compareLimit(limit.request_for_goods_services, line.request_for_goods_services)) return false;
    if (!this.compareLimit(limit.assignment_authority, line.assignment_authority)) return false;
    if (!this.compareLimit(limit.s29_performance_limit, line.s29_performance_limit)) return false;
    if (!this.compareLimit(limit.s30_payment_limit, line.s30_payment_limit)) return false;

    return true;
  }

  async findRelevantFormALines(formA: Position, coding: string): Promise<FormBAuthorityLine[]> {
    let lines = formA.authority_lines || [];
    let matches = new Array<FormBAuthorityLine>();

    console.log("WORKING ON LINE", coding)

    for (let line of lines) {
        console.log("   ", line.coding, "to", coding);
    }

    return matches;
  }

  async checkFormBLineLimits(formA: Position, line: FormBAuthorityLine): Promise<Boolean> {
    let matches = await this.findRelevantFormALines(formA, line.coding);

    for (let limit of matches) {
      if (!this.compareLimit(limit.s24_procure_goods_limit, line.s24_procure_goods_limit)) return false;
      if (!this.compareLimit(limit.s24_procure_services_limit, line.s24_procure_services_limit)) return false;
      if (!this.compareLimit(limit.s24_procure_request_limit, line.s24_procure_request_limit)) return false;
      if (!this.compareLimit(limit.s24_procure_assignment_limit, line.s24_procure_assignment_limit)) return false;
      if (!this.compareLimit(limit.s23_procure_goods_limit, line.s23_procure_goods_limit)) return false;
      if (!this.compareLimit(limit.s23_procure_services_limit, line.s23_procure_services_limit)) return false;
      if (!this.compareLimit(limit.s24_transfer_limit, line.s24_transfer_limit)) return false;
      if (!this.compareLimit(limit.s23_transfer_limit, line.s23_transfer_limit)) return false;
      if (!this.compareLimit(limit.s24_travel_limit, line.s24_travel_limit)) return false;
      if (!this.compareLimit(limit.other_limit, line.other_limit)) return false;
      if (!this.compareLimit(limit.loans_limit, line.loans_limit)) return false;
      if (!this.compareLimit(limit.trust_limit, line.trust_limit)) return false;
      if (!this.compareLimit(limit.s29_performance_limit, line.s29_performance_limit)) return false;
      if (!this.compareLimit(limit.s30_payment_limit, line.s30_payment_limit)) return false;
    }

    return true;
  }

  compareLimit(limit: number, value: number): Boolean {
    if (limit == -1) return true;
    if (value == -1) return false;
    return limit >= value;
  }
}
