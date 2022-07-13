import { ObjectId } from "mongodb";
import { MongoEntity } from ".";
import { Department } from "./";
import { Employee } from "./";

export interface Authority extends MongoEntity {
    //_id?: ObjectId;
    employee_id: ObjectId|undefined;
    // department_id: ObjectId;
    department_code: string;
    department_descr: String
    program: string;
    title: string;
    employee_name: string;
    issue_date: Date;
    expiry_date?: Date;
    archive_date?: Date;
    archive_reason?: string;
    supervisor_name: string;
    supervisor_title: string;

    employee_signed: boolean;
    supervisor_signed: boolean;
    reviewed_by_department: boolean;

    formb_file_reference?: ObjectId;
    memo_file_reference?: ObjectId;
    authority_lines?: AuthorityLine[];

    // used in DTO only
    department?: Department;
    employee?: Employee;
    issue_date_display?: string;
}

// Form A

// export interface FormA extends MongoEntity {
//     //_id?: ObjectId;
//     // department_id: ObjectId;
//     department_code: String;
//     department_descr: String
//     position: string;
//     issue_date: Date;
//     archive_date?: Date;
//     archive_reason?: string;

//     reviewed_by_department: boolean;
//     reviewed_by_person?: String
//     reviewed_by_date?: Date;

//     formb_file_reference?: ObjectId; //maybe this should be an array?
//     memo_file_reference?: ObjectId;
//     authority_lines?: AuthorityLine[];

//     // used in DTO only
//     // department?: Department;
//     employee?: Employee;
//     issue_date_display?: string;
// }

export interface AuthorityLine {
    // authority_id: ObjectId;
    dept: string;
    vote: string;
    prog: string;
    activity: string;
    element: string;
    allotment: string;
    object: string;
    ledger1: string;
    ledger2: string;
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


