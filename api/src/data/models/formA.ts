import { ObjectId } from "mongodb";
import { MongoEntity } from ".";
import { Employee } from "./";

export interface FormA extends MongoEntity {
  //_id?: ObjectId;
  // department_id: ObjectId;
  department_code: string;
  department_descr: string
  program_branch: string;
  position: string;
  issue_date: Date;
  archive?: {
    date: Date,
    reason: String;
    by: String; //email address
    sub: String; //sub value from the JWT token
  }
  updated_by?: String //email address
  updated_on?: Date;
  reviewed_by_department: boolean;
  reviewed_by_person?: String
  reviewed_by_date?: Date;

  formb_file_reference?: ObjectId; //maybe this should be an array?
  memo_file_reference?: ObjectId;
  authority_lines?: formAAuthorityLine[];

  // used in DTO only
  // department?: Department;
  employee?: Employee;
  issue_date_display?: string; //the date the form is approved and goes into effect
  created_by: string;
  created_on?: Date; // the date the file was origianlly created

}

export interface formAAuthorityLine {
  // authority_id: ObjectId;
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

export enum operationalRestrictions {
  "" = "",
  "Bank Deposit" = "Bank Deposit",
  "Personnel Pay Actions" = "Personnel Pay Actions",
  "All Department Payments" = "All Department Payments",
  "Journal Only" = "Journal Only",
  "Acquisition cards" = "Acquisition cards",
  "Bank deposits" = "Bank deposits",
  "Period 14 only" = "Period 14 only"
}
