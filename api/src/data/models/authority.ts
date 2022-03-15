import { ObjectId } from "mongodb";

export interface Authority {
    _id?: ObjectId;
    employee_id: ObjectId;
    department_id: ObjectId;
    program: string;
    title: string;
    issue_date: Date;
    activated_by_memo: boolean;
    expiry_date?: Date;
    cancelled_date?: Date;
    cancelled_reason?: string;
    supervisor_name: string;
    supervisor_title: string;
    employee_signed: boolean;
    supervisor_signed: boolean;

    file_reference?: ObjectId;
    authority_lines?: AuthorityLine[];
}

export interface AuthorityLine {
    account_mask: string;
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

export interface Employee {
    _id?: ObjectId;
    employee_id: number;
    first_name: string;
    last_name: string;
    ynet_id: string;
    email: string;

    authorities?: Authority[];
}

export interface Department {
    _id?: ObjectId;
    name: string;
    account_prefix: string;
}
