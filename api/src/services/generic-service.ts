// import { Collection, FilterQuery, ObjectId } from "mongodb";
import { Collection, ObjectId, Filter } from "mongodb";
import { API_GATEWAY_KEY } from "src/config";

export class GenericService {

    private db: Collection;

    constructor(db: Collection) {
        this.db = db;
    }

    async create(item: any): Promise<any> {
        console.log(item)
        return this.db.insertOne(item);
    }

    async update(id: string, item: any): Promise<any> {
        return this.db.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: item });
    }

    async delete(id: string): Promise<any> {
        return this.db.deleteOne({ _id: new ObjectId(id) });
    }

    async getAll(query: Filter<any>, sort?: any): Promise<any[]> {
        return this.db.find(query).sort(sort).toArray();
    }

    async deleteWhere(query: Filter<any>): Promise<any> {
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
