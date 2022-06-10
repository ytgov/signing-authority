import _ from "lodash";
import { Collection } from "mongodb";
import { User } from "../data/models";

export class UserService {

    private db: Collection<User>;

    constructor(db: Collection<User>) {
        this.db = db;
    }

    async create(user: any): Promise<any> {
        let existing = await this.db.find({ email: user.email }).count();

        if (existing > 0)
            return undefined;

        user.create_date = new Date();

        return await this.db.insertOne(user);
    }

    async update(email: string, item: any) {
        return this.db.findOneAndUpdate({ email }, item);
    }

    async getAll(): Promise<User[]> {
        return this.db.find<User>({}).toArray();
    }

    async getByEmail(email: string): Promise<User | null> {
        return this.db.findOne<User>({ email });
    }

    async getBySub(sub: string): Promise<User | null> {
        return this.db.findOne<User>({ sub });
    }
}
