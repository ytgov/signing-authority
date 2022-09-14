import { ObjectId } from "mongodb";
import { MongoEntity, Position } from ".";

export interface PositionGroup extends MongoEntity {
  department_code: string;
  department_descr: string;
  program?: string;
  activity?: string;

  create_date: Date;
  created_by: string;
  created_by_id: ObjectId;

  status: string;

  finance_review_complete?: ElectronicApproval;
  finance_review_reject?: ElectronicApproval;

  finance_approval_complete?: ElectronicApproval;
  finance_approval_reject?: ElectronicApproval;
  activated_positions?: any[];

  upload_signatures?: SignaturesApproval;

  create_date_display?: string;
  positions?: Array<Position>;
  authority_lines?: Array<any>;
}

export interface ElectronicApproval {
  id: ObjectId;
  name: string;
  comments?: string;
  date: Date;
  date_display?: string;
}

export interface SignaturesApproval {
  id: ObjectId;
  name: string;
  comments?: string;
  date: Date;
  deputy_minister_name: string;
  department_administrator_name: string;
  date_display?: string;
  file_id: ObjectId;
}
