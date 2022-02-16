import { MongoClient, MongoClientOptions, Collection, MongoCredentials } from "mongodb";
import { MONGO_URL, MONGO_DB } from "../config";
import { GenericService } from "../services";

let options:MongoClientOptions = {
    connectTimeoutMS: 3000,
    retryWrites: true}

export class Storage {
    mongoConnection!: MongoClient;
    isInitialized: boolean = false;
    Authorities!: GenericService;
    constructor() {
    }
    async ensureConnected(): Promise<string> {
        if (this.isInitialized)
            return Promise.resolve("connected");
        return new Promise((resolve, reject) => {
             MongoClient.connect(MONGO_URL, options )
            .then(resp => {
                    this.mongoConnection = resp;
                    //Subscriptions are from the old project
                    this.Authorities = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Subscriptions"));
                    this.isInitialized = true;
                    resolve("Connected");
                })
                .catch(err => {
                    console.error("Can't connet to MongoDB @", MONGO_URL)
                    console.error(err);
                    reject(err);
                })
        })
    }
}
