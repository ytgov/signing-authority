import { MongoClient, MongoClientOptions } from "mongodb";
import { FileStore } from "../utils/file-store";
import { MongoFileStore } from "../utils/mongo-file-store";
import { MONGO_URL, MONGO_DB } from "../config";
import { GenericService, UserService } from "../services";
import { Authority, Employee, OperationalRestriction, Position, PositionGroup } from "./models";

let options: MongoClientOptions = {
    connectTimeoutMS: 3000,
    retryWrites: true
};

export class Storage {
    mongoConnection!: MongoClient;
    isInitialized: boolean = false;
    Authorities!: GenericService<Authority>;
    Employees!: GenericService<Employee>;
    OperationalRestrictions!: GenericService<OperationalRestriction>;
    // Departments!: GenericService<Department>;
    Users!: UserService;
    Files!: FileStore;
    FormA!: GenericService<Position>;
    PositionGroups!: GenericService<PositionGroup>;

    constructor() {
    }

    async ensureConnected(): Promise<string> {
        if (this.isInitialized)
            return Promise.resolve("connected");

        return new Promise((resolve, reject) => {
            MongoClient.connect(MONGO_URL, options)
                .then(async resp => {
                    this.mongoConnection = resp;

                    //Subscriptions are from the old project
                    this.Authorities = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Authorities"));
                    this.FormA = new GenericService(this.mongoConnection.db(MONGO_DB).collection("FormA"));
                    this.PositionGroups = new GenericService(this.mongoConnection.db(MONGO_DB).collection("PositionGroups"));
                    this.Employees = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Employees"));
                    this.OperationalRestrictions = new GenericService(this.mongoConnection.db(MONGO_DB).collection("OperationalRestrictions"));
                    this.Users = new UserService(this.mongoConnection.db(MONGO_DB).collection("Users"));
                    this.Files = new MongoFileStore(this.mongoConnection.db(MONGO_DB));

                    this.isInitialized = true;
                    resolve("Connected");
                })
                .catch(err => {
                    console.error("Can't connet to MongoDB @", MONGO_URL);
                    console.error(err);
                    reject(err);
                });

        });
    }
}
