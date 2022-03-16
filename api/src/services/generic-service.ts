import { Collection, ObjectId, Filter, InsertOneResult, DeleteResult } from "mongodb";
import { MongoEntity } from "../data/models";

export class GenericService<T extends MongoEntity> {

    private db: Collection;

    constructor(db: Collection) {
        this.db = db;
    }

    async create(item: T): Promise<InsertOneResult<T>> {
        return this.db.insertOne(item);
    }

    async update(id: string, item: T): Promise<T | undefined> {
        return this.db.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: item })
            .then(result => {
                if (result.ok == 1)
                    return result.value as T;

                return undefined;
            })
            .catch(err => {
                console.log("UPDATE ERROR");
                return undefined;
            })
    }

    async delete(id: string): Promise<DeleteResult> {
        return this.db.deleteOne({ _id: new ObjectId(id) });
    }

    async getAll(query: Filter<any>, sort?: any): Promise<T[]> {
        return (await this.db.find(query).sort(sort).toArray()) as T[];
    }

    async getOne(query: Filter<any>): Promise<T | undefined> {
        return (await this.db.findOne(query)) as T;
    }

    async deleteWhere(query: Filter<any>): Promise<DeleteResult> {
        return this.db.deleteMany(query);
    }

    async getById(id: string): Promise<any | null> {
        try {
            return this.db.findOne<any>({ _id: new ObjectId(id) });
        }
        catch (e) { }

        return null;
    }
}
