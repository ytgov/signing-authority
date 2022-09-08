import { MongoEntity, Position } from ".";

export interface PositionGroup extends MongoEntity {
    department_code: string;
    program?: string;
    activity?: string;

    create_date: Date;
    created_by: string;

    status: string;
}
