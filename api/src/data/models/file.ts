import { MongoEntity } from ".";

export interface StoredFile extends MongoEntity {
    filename: string;
    fileSize: number;
    mimeType: string;
    content: Buffer;
    uploadedBy?: string; //the user who uploaded this file
}
