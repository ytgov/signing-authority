import { db } from "../data";
import _ from "lodash";

export class UserService {

    async create(email: string, first_name: string, last_name: string, status: string, roles: string): Promise<any> {
        let existing = await db("user").where({ email }).count("email as cnt");

        if (existing[0].cnt > 0)
            return undefined;

        let user = { email, first_name, last_name, status, roles, create_date: new Date() };

        return await db("user").insert(user);
    }

    async update(email: string, item: any) {
        return db("user").where({ email }).update(item);
    }

    async getAll() {
        return db("user");
    }

    async getByEmail(email: string): Promise<any | undefined> {
        return db("user").where({ email }).first();
    }

    async getAccessFor(email: string): Promise<string[]> {
        return ["asdf"]
    }

    async setAccess(email: string, access: string[]) {
        return ""
    }

    async makeDTO(userRaw: any) {
        let dto = userRaw;
        dto.display_name = `${userRaw.first_name} ${userRaw.last_name}`;
        dto.roles = _.split(userRaw.roles, ",").filter((r: string) => r.length > 0);
        //dto.access = await db.getAccessFor(userRaw.email);
        //dto.display_access = _.join(dto.access.map((a: any) => a.level), ", ")

        return dto;
    }
}
