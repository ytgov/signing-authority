import { MongoEntity } from ".";
import { Authority } from "./authority";


export interface Employee extends MongoEntity {
    employee_id: number;
    first_name: string;
    last_name: string;
    ynet_id: string;
    email: string;
    primary_department: string;

    authorities?: Authority[];
    created_by?: string;
    created_date?: Date;

    // used in DTO only
    position?: string;
    display_name?: string;
    long_name?: string;
}
