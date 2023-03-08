import { ObjectId } from "mongodb";
import { Department, MongoEntity, Employee, StoredFile, ReviewResults, Authority } from ".";

export interface Position extends MongoEntity {
  department_code: string;
  department_descr: string;
  program_branch: string;
  activity?: string;

  position: string;

  is_deputy_minister?: Boolean;
  is_deputy_duplicate?: Boolean;

  authority_lines?: PositionAuthorityLine[];
  audit_lines?: PositionAuditLine[];

  position_group_id?: ObjectId;

  department_reviews?: ReviewResults[];
  finance_reviews?: ReviewResults[];

  activation?: {
    date: Date;
    activate_user_id: ObjectId;
    //recommender_name: string;
    //approver_name: string;
    file_id: ObjectId; //maybe this should be an array?
  };

  deactivation?: {
    date: Date;
    reason: string;
    by: string; //email address
    sub: string; //sub value from the JWT token
  };

  // used in DTO only
  program_activity?: string;
  status?: string;
  department?: Department;
  active_authorities?: Authority[];
  issue_date_display?: string; //the date the form is approved and goes into effect
}

export interface PositionAuthorityLine {
  coding: string;
  coding_display?: string;

  dept?: string;
  vote?: string;
  prog?: string;
  activity?: string;
  element?: string;
  allotment?: string;
  object?: string;
  ledger1?: string;
  ledger2?: string;

  operational_restriction?: string;
  notes?: string;

  //**   Note: -1 means: No Limit or NL **//
  contracts_for_goods_services: number;
  loans_and_guarantees: number;
  transfer_payments: number;
  authorization_for_travel: number;
  request_for_goods_services: number;
  assignment_authority: number;
  s29_performance_limit: number;
  s30_payment_limit: number;
}

export interface PositionAuditLine {
  date: Date;
  user_name: string;
  action: string;
  previous_value: Object;

  date_display?: string;
}

export enum OperationalRestrictions {
  "" = "",
  "Journal only" = "Journal only",
  "Acquisition cards" = "Acquisition cards",
  "Refund as per FAM 7.6" = "Refund as per FAM 7.6",
  "Personnel pay action" = "Personnel pay action",
  "Travel advance" = "Travel advance",
  "Special delegation" = "Special delegation",
  "Bank deposit" = "Bank deposit",
  "Period 14 only" = "Period 14 only",
  "Aircraft Charters S23 only" = "Aircraft Charters S23 only",
  "Purchase Contracts S23 only" = "Purchase Contracts S23 only",
  "Travel Warrant S23 only" = "Travel Warrant S23 only",
  "Print Contracts S23 only" = "Print Contracts S23 only",
  "Q journals only" = "Q journals only",
  "V journals only" = "V journals only",
  "CDPITNEYWORK only" = "CDPITNEYWORK only",
}

export function setPositionStatus(item: Position) {
  if (item.deactivation) item.status = "Archived";
  else if (item.activation) {
    item.status = "Active";
  } else if (item.position_group_id) {
    item.status = "Locked";
  } else item.status = "Inactive (Draft)";
}
