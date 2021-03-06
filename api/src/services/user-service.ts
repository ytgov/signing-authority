import _ from "lodash";
import { Collection } from "mongodb";
import { User } from "../data/models";

export class UserService {

    private db: Collection<User>;

    constructor(db: Collection<User>) {
        this.db = db;
    }

    async create(email: string, first_name: string, last_name: string, status: string, roles: string): Promise<any> {
        let existing = await this.db.find({ email }).count();

        if (existing > 0)
            return undefined;

        let user = { email, first_name, last_name, status, roles, create_date: new Date() };

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

    async makeDTO(userRaw: any) {
        let dto = userRaw;
        dto.display_name = `${userRaw.first_name} ${userRaw.last_name}`;
        dto.roles = _.split(userRaw.roles, ",").filter((r: string) => r.length > 0);

        return dto;
    }
}
