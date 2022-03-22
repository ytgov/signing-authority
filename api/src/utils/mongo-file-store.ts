import { StoredFile } from "../data/models";
import { FileStore } from "./file-store";
import { Db, Filter, GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream"


export class MongoFileStore implements FileStore {

    readonly FILE_COLLECTION_NAME = "SAA-FILES";
    db: Db
    bucket: GridFSBucket;

    constructor(db: Db) {
        this.db = db;
        this.bucket = new GridFSBucket(this.db, { bucketName: this.FILE_COLLECTION_NAME })
    }

    async getFiles(filter: Filter<any>): Promise<StoredFile[]> {
        let allFiles = new Array<any>();
        const cursor = this.bucket.find(filter);

        await cursor.forEach(doc => {
            let mimeType = doc.metadata ? doc.metadata.mimeType : "";

            let file = {
                id: doc._id.toString(),
                fileSize: doc.length,
                filename: doc.filename,
                content: Buffer.from(''),
                uploadedBy: doc.metadata?.uploadedBy,
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
            mimeType: "",
            content: Buffer.from([])
        };

        await cursor.forEach(doc => {
            let mimeType = doc.metadata ? doc.metadata.mimeType : "";
            storedFile.fileSize = doc.length;
            storedFile.filename = doc.filename;
            storedFile.mimeType = mimeType
        });

        return new Promise((resolve, reject) => {
            let download = this.bucket.openDownloadStream(new ObjectId(key));
            let buffer = new Array();

            download.on('end', async (en: Buffer) => {
                storedFile.content = Buffer.concat(buffer)
                resolve(storedFile)
            }).on("data", (chunk: Buffer) => {
                buffer.push(chunk);
            });
        });
    }

    putFile(file: StoredFile): Promise<StoredFile> {
        let stream = Readable.from(file.content);
        let mongoResponse = stream.pipe(this.bucket.openUploadStream(file.filename, { metadata: { mimeType: file.mimeType, uploadedBy: file.uploadedBy } }));
        file._id = mongoResponse.id;
        return Promise.resolve(file);
    }

    removeFile(key: string): Promise<any> {
        return this.bucket.delete(new ObjectId(key));
    }
}
