import { StoredFile } from "../data/models";
import { FileStore } from "./file-store";
import { Db, MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { MONGO_DB } from "../config";
import { Readable } from "stream"

export class MongoFileStore implements FileStore {

    client: MongoClient;
    db: Db
    bucket: GridFSBucket;

    constructor(client: MongoClient) {
        this.client = client;
        this.db = this.client.db(MONGO_DB);
        this.bucket = new GridFSBucket(this.db)
    }

    async getAllFiles(): Promise<StoredFile[]> {
        let allFiles = new Array<any>();
        const cursor = this.bucket.find({});

        await cursor.forEach(doc => {
            let mimeType = doc.metadata ? doc.metadata.mimeType : "";

            let file = {
                id: doc._id.toString(),
                fileSize: doc.length,
                filename: doc.filename,
                content: Buffer.from(''),
                uploadedBy: doc.metadata,
                mimeType
            }

            allFiles.push(file)
        });

        return Promise.resolve(allFiles);
    }

    async getFile(key: string): Promise<StoredFile> {
        const cursor = this.bucket.find({ _id: new ObjectId(key) });

        let storedFile: StoredFile = {
            fileSize: 0,
            filename: "",
            content: Buffer.from(''),
            mimeType: ""
        }

        await cursor.forEach(doc => {
            let mimeType = doc.metadata ? doc.metadata.mimeType : "";

            storedFile.id = doc._id.toString();
            storedFile.fileSize = doc.length;
            storedFile.filename = doc.filename;
            storedFile.mimeType = mimeType
        });

        return Promise.resolve(storedFile)
    }

    putFile(file: StoredFile): Promise<StoredFile> {
        let stream = Readable.from(file.content);
        let mongoResponse = stream.pipe(this.bucket.openUploadStream(file.filename, { metadata: { mimeType: file.mimeType, uploadedBy: file.uploadedBy } }));
        file.id = mongoResponse.id.toString();
        return Promise.resolve(file);
    }

    removeFile(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async uploadedBy(key: string): Promise<StoredFile> {
        const cursor = this.bucket.find({ 'metadata.uploadedBy': key });

        let storedFile: StoredFile = {
            fileSize: 0,
            filename: "",
            content: Buffer.from(''),
            mimeType: ""
        }

        await cursor.forEach(doc => {
            let mimeType = doc.metadata ? doc.metadata.mimeType : "";

            storedFile.id = doc._id.toString();
            storedFile.fileSize = doc.length;
            storedFile.filename = doc.filename;
            storedFile.mimeType = mimeType
        });

        return Promise.resolve(storedFile)
    }

}
