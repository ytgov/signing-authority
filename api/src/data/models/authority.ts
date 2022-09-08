import { ObjectId } from "mongodb";
import { UnwrapPromiseLike } from "puppeteer";
import { Position, MongoEntity, User, Department, Employee, StoredFile } from ".";


export interface Authority extends MongoEntity {

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

    authority_lines: FormBAuthorityLine[];
    audit_lines?: FormBAuditLine[];

    department_reviews?: ReviewResults[];
    finance_reviews?: ReviewResults[];

    activation?: [
        {
            date: Date;
            expire_date?: Date;
            activate_reason: string;
            archive_reason?: string;
            activate_user_id: ObjectId;

            file?: StoredFile;
            memo?: StoredFile;
        }
    ];

    // used in DTO only
    department?: Department;
    form_a: Position | null;
    //employee?: Employee;
    //supervisor?: Employee;

    issue_date_display?: string;
    created_by?: User;
}

export interface ReviewResults {
    date: Date;
    user_id: ObjectId;
    result: ReviewResultType;
    note?: string;
}

export enum ReviewResultType {
    Approved = "Approved",
    Rejected = "Rejected"
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
