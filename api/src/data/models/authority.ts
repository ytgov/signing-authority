import moment from "moment";
import { ObjectId } from "mongodb";
import { Position, MongoEntity, User, Department, Employee, StoredFile } from ".";

export interface Authority extends MongoEntity {
  created_by_id: ObjectId;
  created_by_name: string;
  create_date: Date;
  cancel_date?: Date;
  cancel_by_name?: string;

  employee: {
    name: string;
    title: string;
    upn: string;
    email: string;
    ynet_id: string;
    signed_date?: Date;
    value?: Employee;
  };

  supervisor: {
    name: string;
    title: string;
    upn: string;
    email: string;
    ynet_id: string;
    signed_date?: Date;
    value?: Employee;
  };

  form_a_id: ObjectId;

  department_code: string;
  department_descr: string;
  program_branch: string;

  authority_type: string; // substantive or temp/memo

  authority_lines: FormBAuthorityLine[];
  audit_lines?: FormBAuditLine[];

  department_reviews?: ReviewResults[];
  finance_reviews?: ReviewResults[];
  upload_signatures?: any;

  activation?: ActivationRecord[];

  // used in DTO only
  department?: Department;
  form_a: Position | null;

  issue_date_display?: string;
  created_by?: User;
  status?: string;
}

export interface ActivationRecord {
  date: Date | string;
  expire_date?: Date;
  activate_reason: string;
  archive_reason?: string;
  activate_user_id: ObjectId;
  approve_user_email: string;
  approve_user_date?: Date;
  reject_user_date?: Date;

  file?: StoredFile;
  memo?: StoredFile;
  current_status?: string;
}

export interface ReviewResults {
  date: Date;
  name: string;
  user_id: ObjectId;
  result: ReviewResultType;
  note?: string;
}

export enum ReviewResultType {
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface FormBAuthorityLine {
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
  s24_procure_goods_limit: number;
  s24_procure_services_limit: number;
  s24_procure_request_limit: number;
  s24_procure_assignment_limit: number;
  s23_procure_goods_limit: number;
  s23_procure_services_limit: number;
  s24_transfer_limit: number;
  s23_transfer_limit: number;
  s24_travel_limit: number;
  other_limit: number;
  loans_limit: number;
  trust_limit: number;
  s29_performance_limit: number;
  s30_payment_limit: number;
}

export interface FormBAuditLine {
  date: Date;
  user_name: string;
  action: string;
  previous_value: Object;

  date_display?: string;
}

export function setAuthorityStatus(item: Authority) {
  //polyfill for Type
  if (!item.authority_type) item.authority_type = "substantive";

  let now = moment().format("YYYYMMDD");
  item.status = "";

  if (item.cancel_date) {
    item.status = "Cancelled";
  }

  if (item.activation && item.activation.length > 0) {
    for (let a of item.activation) {
      if (item.status == "Cancelled") {
        a.current_status = "Cancelled";
        continue;
      }

      let start = moment(a.date).format("YYYYMMDD");

      if (a.approve_user_date) start = moment.max(moment(a.date), moment(a.approve_user_date)).format("YYYYMMDD");

      let expire = moment(a.expire_date || `2999-12-31`).format("YYYYMMDD");

      a.current_status = "Inactive";

      if (item.authority_type == "substantive" && now > expire) a.current_status = "Suspended";
      else if (a.reject_user_date) {
        a.current_status = "Rejected";
      } else if (start > now) {
        a.current_status = "Scheduled";
        if (!item.status) item.status = "Scheduled";
      } else if (start <= now && (a.expire_date == undefined || expire >= now)) {
        a.current_status = "Active";
        item.status = "Active";
      }
    }
  }

  if (item.status == "") {
    item.status = "Inactive (Draft)";

    if (item.finance_reviews) item.status = "Approved";
    else if (item.upload_signatures) item.status = "Upload Signatures";
    else if (item.department_reviews) item.status = "Locked for Signatures";
  }
}

export function setHistoricAuthorityStatus(item: Authority, asAtDate: Date) {
  //polyfill for Type
  if (!item.authority_type) item.authority_type = "substantive";

  let now = moment(asAtDate).format("YYYYMMDD");

  item.status = "Inactive";

  if (item.cancel_date && moment(item.cancel_date).format("YYYYMMDD") < now) {
    item.status = "Cancelled";
    return;
  }

  if (item.activation && item.activation.length > 0) {
    for (let a of item.activation) {
      if (a.reject_user_date) {
        continue;
      }

      let start = moment(a.approve_user_date).format("YYYYMMDD");
      let expire = moment(a.expire_date || `2999-12-31`).format("YYYYMMDD");

      if (start <= now) {
        if (a.expire_date == undefined || expire >= now) {
          item.status = "Active";
        }
      }
    }
  }
}
