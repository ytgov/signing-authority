
import { ObjectId } from "mongodb";

export class MongoEntity {
    _id?: ObjectId
}

export * from "./authority";
export * from "./file";
export * from "./user";
export * from "./formA";
export * from "./department";
export * from "./employee";

