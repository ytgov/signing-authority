import { ObjectId } from "mongodb";
import { MongoEntity } from ".";

export interface Authority extends MongoEntity {
    //_id?: ObjectId;
    employee_id: ObjectId;
    department_id: ObjectId;
    program: string;
    title: string;
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
}

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

export interface Employee extends MongoEntity {
    employee_id: number;
    first_name: string;
    last_name: string;
    ynet_id: string;
    email: string;

    authorities?: Authority[];

    // used in DTO only
    display_name?: string;
}

export interface Department extends MongoEntity {
    name: string;
    account_prefix: string;

    // used in DTO only
    authorities?: Authority[];
}
