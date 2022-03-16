import { GenericService } from "src/services";
import { MongoFileStore } from "src/utils/mongo-file-store";
import { MONGO_DB } from "../config";
import { Authority, AuthorityLine, Department, Employee } from "./models";
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

    // remove all employees
    if (collections.indexOf("Departments") >= 0) {
        await myDb.dropCollection("Departments");
    }

    let empDb = storage.Employees as GenericService<Employee>;

    // put in some employees
    let emp1 = await empDb.create({ first_name: "Michael", last_name: "Johnson", employee_id: 12345, email: "michael@icefoganalytics.com", ynet_id: "MRJOHNSO" });
    let emp2 = await empDb.create({ first_name: "Ryan", last_name: "Agar", employee_id: 54321, email: "ryanjagar@hey.com", ynet_id: "RAGAR" });

    let depDb = storage.Departments as GenericService<Department>;
    // put in some departments
    await depDb.create({ name: "Justice", account_prefix: "15" });
    let dep1 = await depDb.create({ name: "Highways and Public Works", account_prefix: "55" });
    await depDb.create({ name: "Community Services", account_prefix: "12" });
    await depDb.create({ name: "Environment", account_prefix: "20" });
    await depDb.create({ name: "Health and Social Services", account_prefix: "33" });

    let autDb = storage.Authorities as GenericService<Authority>;

    let auth1Lines = new Array<AuthorityLine>();
    auth1Lines.push({
        dept: "55", vote: "1", prog: "15", activity: "10", element: "**", allotment: "**", object: "****", ledger1: "", ledger2: "",
        s24_procure_goods_limit: 123,
        s24_procure_services_limit: 123,
        s24_procure_request_limit: 123,
        s24_procure_assignment_limit: 123,
        s23_procure_goods_limit: 123,
        s23_procure_services_limit: 123,
        s24_transfer_limit: 123,
        s23_transfer_limit: 123,
        s24_travel_limit: 123,
        other_limit: 123,
        loans_limit: 123,
        trust_limit: 123,
        s29_performance_limit: 123,
        s30_payment_limit: 123
    });

    auth1Lines.push({
        dept: "55", vote: "1", prog: "15", activity: "30", element: "**", allotment: "**", object: "****", ledger1: "", ledger2: "",
        s24_procure_goods_limit: 222,
        s24_procure_services_limit: 222,
        s24_procure_request_limit: 222,
        s24_procure_assignment_limit: 222,
        s23_procure_goods_limit: 222,
        s23_procure_services_limit: 222,
        s24_transfer_limit: 222,
        s23_transfer_limit: 222,
        s24_travel_limit: 222,
        other_limit: 222,
        loans_limit: 222,
        trust_limit: 222,
        s29_performance_limit: 222,
        s30_payment_limit: 222
    });
    auth1Lines.push({
        dept: "55", vote: "1", prog: "15", activity: "**", element: "**", allotment: "02", object: "****", ledger1: "", ledger2: "",
        s24_procure_goods_limit: 222,
        s24_procure_services_limit: 222,
        s24_procure_request_limit: 222,
        s24_procure_assignment_limit: 222,
        s23_procure_goods_limit: 222,
        s23_procure_services_limit: 222,
        s24_transfer_limit: 222,
        s23_transfer_limit: 222,
        s24_travel_limit: 222,
        other_limit: 222,
        loans_limit: 222,
        trust_limit: 222,
        s29_performance_limit: 222,
        s30_payment_limit: 222
    });

    let auth1 = await autDb.create({
        department_id: dep1.insertedId, employee_id: emp1.insertedId, issue_date: new Date(), title: "Manager", program: "ICT", supervisor_name: "Ryan Agar",
        reviewed_by_department: true, employee_signed: false, supervisor_signed: false, supervisor_title: "Director, Marketing", authority_lines: auth1Lines
    });
}