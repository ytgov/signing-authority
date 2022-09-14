import _ from "lodash";
import { Collection, ObjectId } from "mongodb";
import { User } from "../data/models";

export class UserService {
  private db: Collection<User>;

  constructor(db: Collection<User>) {
    this.db = db;
  }

  async create(user: any): Promise<any> {
    let existing = await this.db.find({ email: user.email }).toArray();

    if (existing.length > 0) return undefined;

    user.create_date = new Date();
    return await this.db.insertOne(user);
  }

  async update(_id: ObjectId, item: any) {
    return this.db.findOneAndReplace({ _id }, item);
  }

  async getAll(query = {}): Promise<User[]> {
    return this.db.find<User>(query).toArray();
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.db.findOne<User>({ email });
  }

  async getBySub(sub: string): Promise<User | null> {
    return this.db.findOne({ sub });
  }

  async delete(id: string) {
    return this.db.deleteOne({ _id: new ObjectId(id) });
  }
}
