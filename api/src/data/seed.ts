import { GenericService } from "src/services";
import { MongoFileStore } from "src/utils/mongo-file-store";
import { MONGO_DB } from "../config";
import { Authority, FormBAuthorityLine, Employee, Position } from "./models";
import { Storage } from "./storage";
import { employeeSeedData, formASeedData } from "./seed-data";
import { ObjectId } from "mongodb";


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

    // remove all FormAs

    if (collections.indexOf("FormA") >= 0) {
        await myDb.dropCollection("FormA");
    }



    // put in some employees

    let empDb = storage.Employees as GenericService<Employee>;
    for (let index = 0; index < employeeSeedData.length; index++) {
        const element = employeeSeedData[index];
        let m = await empDb.create(element);
        // console.log(m);
    };

    const emp1 = await empDb.getOne({ "email": "michael@icefoganalytics.com" });
    const emp2 = await empDb.getOne({ "email": "ryanjagar@hey.com" });

    // put in some FormAs
    let formADB = storage.FormA as GenericService<Position>;

    for (let index = 0; index < formASeedData.length; index++) {
        const element = formASeedData[index];
        console.log(element);
        let m = await formADB.create(element);
    };

    const formA1 = (await formADB.getAll({}))[0];

    // console.log(emp1);
    // let emp1 = await empDb.create(employeeSeedData[1]);
    // console.log(emp1)
    // let emp2 = await empDb.create(employeeSeedData [2]);
    // let emp3 = await empDb.create(employeeSeedData [0]);
    // let emp1 = await empDb.create({ first_name: "Michael", last_name: "Johnson", employee_id: 12345, email: "michael@icefoganalytics.com", ynet_id: "MRJOHNSO" });
    // let emp2 = await empDb.create({ first_name: "Ryan", last_name: "Agar", employee_id: 54321, email: "ryanjagar@hey.com", ynet_id: "RAGAR" });

    // let depDb = storage.Departments as GenericService<Department>;
    // // put in some departments
    // await depDb.create({ name: "Justice", account_prefix: "15" });
    // let dep1 = await depDb.create({ name: "Highways and Public Works", account_prefix: "55" });
    // await depDb.create({ name: "Community Services", account_prefix: "12" });
    // await depDb.create({ name: "Environment", account_prefix: "20" });
    // await depDb.create({ name: "Health and Social Services", account_prefix: "33" });

    let autDb = storage.Authorities as GenericService<Authority>;

    let auth1Lines = new Array<FormBAuthorityLine>();
    auth1Lines.push({
        coding: "5511510",
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
        s29_performance_limit: 123,
        s30_payment_limit: 123
    });

    auth1Lines.push({
        coding: "5511530",
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
        s29_performance_limit: 222,
        s30_payment_limit: 222
    });
    auth1Lines.push({
        coding: "55115",
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
        s29_performance_limit: 222,
        s30_payment_limit: 222
    });

/*     let auth1 = await autDb.create({
        department_code: "55",
        department_descr: "Highways and Public Works",
        program_branch: "ICT",
        employee: { name: emp1?.first_name || "", title: emp1?.position || "", email:"michael@icefoganalytics.com", ynet_id: "mrjohnson", upn: "mrjohnson@ynet.gov.yk.ca"  },
        supervisor: { name: emp1?.first_name || "", title: emp1?.position || "", email:"ryanjagar@hey.com", ynet_id: "ragar", upn: "ragar@ynet.gov.yk.ca" },
        //title: "Manager",
        //supervisor_name: "Ryan Agar",
        //reviewed_by_department_date: new Date(),
        //employee_signed_date: undefined,
        //supervisor_signed_date: undefined,
        //supervisor_title: "Director, Marketing",
        authority_lines: auth1Lines,
        //create_date: new Date(),
        //create_user_id: emp1?._id || new ObjectId(),
        form_a_id: formA1._id || new ObjectId(),
    }); */
}