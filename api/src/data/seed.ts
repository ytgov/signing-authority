import { GenericService } from "../services";
import { Authority, FormBAuthorityLine, Employee, Position } from "./models";
import { Storage } from "./storage";

export async function Seed(storage: Storage) {
    await storage.ensureConnected();

    // Clear existing data (child tables cascade via FK)
    await storage.db("authorities").del();
    await storage.db("positions").del();
    await storage.db("position_groups").del();
    await storage.db("stored_files").del();
    await storage.db("employees").del();
    await storage.db("operational_restrictions").del();

    // Seed employees
    let empDb = storage.Employees as GenericService<Employee>;
    await empDb.create({
        first_name: "Michael",
        last_name: "Johnson",
        employee_id: 12345,
        email: "michael@icefoganalytics.com",
        ynet_id: "MRJOHNSO",
    });
    await empDb.create({
        first_name: "Ryan",
        last_name: "Agar",
        employee_id: 54321,
        email: "ryanjagar@hey.com",
        ynet_id: "RAGAR",
    });

    const emp1 = await empDb.getOne({ email: "michael@icefoganalytics.com" });
    const emp2 = await empDb.getOne({ email: "ryanjagar@hey.com" });

    console.log("Seeded employees:", emp1?.email, emp2?.email);
    console.log("Seed complete.");
}
