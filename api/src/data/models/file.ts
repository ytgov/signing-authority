import { MongoEntity } from ".";


export interface StoredFile extends MongoEntity {
    filename: string;
    file_size: number;
    mime_type: string;
    content: Buffer;
    uploaded_by?: string; //the user who uploaded this file
    upload_date?: Date;
}
