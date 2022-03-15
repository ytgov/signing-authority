import { GenericService } from "src/services";
import { MongoFileStore } from "src/utils/mongo-file-store";
import { MONGO_DB } from "../config";
import { Department, Employee } from "./models";
import { Storage } from "./storage";


export async function Seed(storage: Storage) {
    const fileDb = storage.Files as MongoFileStore;
    const myDb = storage.mongoConnection.db(MONGO_DB);
    const collections = (await myDb.listCollections({}).toArray()).map(c => c.name);

    // remove all file
    if (collections.indexOf(`${fileDb.FILE_COLLECTION_NAME}.files`) >= 0) {
        await myDb.dropCollection(`${fileDb.FILE_COLLECTION_NAME}.files`);
        await myDb.dropCollection(`${fileDb.FILE_COLLECTION_NAME}.chunks`);
    }

    // remove all authorities
    if (collections.indexOf("Authorities") >= 0) {
        await myDb.dropCollection("Authorities");
    }

    // remove all employees
    if (collections.indexOf("Employees") >= 0) {
        await myDb.dropCollection("Employees");
    }

    let empDb = storage.Employees as GenericService<Employee>;

    // put in some employees
    await empDb.create({ first_name: "Michael", last_name: "Johnson", employee_id: 12345, email: "michael@icefoganalytics.com", ynet_id: "MRJOHNSO" });
    await empDb.create({ first_name: "Ryan", last_name: "Agar", employee_id: 54321, email: "ryanjagar@hey.com", ynet_id: "RAGAR" });

    let depDb = storage.Departments as GenericService<Department>;
    // put in some departments
    await depDb.create({ name: "Justice", account_prefix: "15" });
    await depDb.create({ name: "Highways and Public Works", account_prefix: "55" });
    await depDb.create({ name: "Community Services", account_prefix: "12" });
    await depDb.create({ name: "Environment", account_prefix: "20" });
    await depDb.create({ name: "Health and Social Services", account_prefix: "33" });
}