// import { Collection, FilterQuery, ObjectId } from "mongodb";
import { Collection, ObjectId, Filter, InsertOneResult, ModifyResult, DeleteResult, Document } from "mongodb";

export class GenericService<T> {

    private db: Collection;

    constructor(db: Collection) {
        this.db = db;
    }

    async create(item: T): Promise<InsertOneResult<T>> {
        return this.db.insertOne(item);
    }

    async update(id: string, item: T): Promise<ModifyResult<any>> {
        return this.db.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: item });
    }

    async delete(id: string): Promise<DeleteResult> {
        return this.db.deleteOne({ _id: new ObjectId(id) });
    }

    async getAll(query: Filter<any>, sort?: any): Promise<any[]> {
        return this.db.find(query).sort(sort).toArray();
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
