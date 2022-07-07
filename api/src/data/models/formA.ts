import { ObjectId } from "mongodb";
import { MongoEntity } from ".";
import { Employee } from "./";

export interface FormA extends MongoEntity {
  //_id?: ObjectId;
  // department_id: ObjectId;
  department_code: string;
  department_descr: string
  program_branch: string;
  issue_date: Date;
  archive_date?: Date;
  archive_reason?: string;

  reviewed_by_department: boolean;
  reviewed_by_person?: String
  reviewed_by_date?: Date;

  formb_file_reference?: ObjectId; //maybe this should be an array?
  memo_file_reference?: ObjectId;
  authority_lines?: formAAuthorityLine[];

  // used in DTO only
  // department?: Department;
  employee?: Employee;
  issue_date_display?: string;
  created_by: string;

}

export interface formAAuthorityLine {
  // authority_id: ObjectId;
  position: string;
  operational_restriction?: string;
  dept: string;
  vote: string;
  prog: string;
  activity: string;
  element: string;
  allotment: string;
  object: string;
  ledger1: string;
  ledger2: string;
  contracts_for_goods_services: number;
  loans_and_guarantees: number;
  transfer_payments: number;
  authorization_for_travel: number;
  request_for_goods_services: number;
  assignment_authority: number;
  s29_performance_limit: number;
  s30_payment_limit: number;

}

export enum operationalRestrictions {
  "" = "",
  "Bank Deposit" = "Bank Deposit",
  "Presonnel Pay Actions" = "Personnel Pay Actions",
  "All Department Payments" = "All Department Payments",
  "Journal Only" = "Journal Only" ,
  "Acquisition cards" = "Acquisition cards",
  "Bank deposits" =   "Bank deposits",
  "Period 14 only" = "Period 14 only"
}
