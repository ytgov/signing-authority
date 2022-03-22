import { MongoClient, MongoClientOptions } from "mongodb";
import { FileStore } from "../utils/file-store";
import { MongoFileStore } from "../utils/mongo-file-store";
import { MONGO_URL, MONGO_DB } from "../config";
import { GenericService, UserService } from "../services";
import { Authority, Department, Employee } from "./models";

let options: MongoClientOptions = {
    connectTimeoutMS: 3000,
    retryWrites: true
}

export class Storage {
    mongoConnection!: MongoClient;
    isInitialized: boolean = false;
    Authorities!: GenericService<Authority>;
    Employees!: GenericService<Employee>;
    Departments!: GenericService<Department>;
    Users!: UserService;
    Files!: FileStore;

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
                    this.Employees = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Employees"));
                    this.Departments = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Departments"));
                    this.Users = new UserService(this.mongoConnection.db(MONGO_DB).collection("Users"));
                    this.Files = new MongoFileStore(this.mongoConnection.db(MONGO_DB));
                    
                    this.isInitialized = true;
                    resolve("Connected");
                })
                .catch(err => {
                    console.error("Can't connet to MongoDB @", MONGO_URL)
                    console.error(err);
                    reject(err);
                });

        })
    }
}
