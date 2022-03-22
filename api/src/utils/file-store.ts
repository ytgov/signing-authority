
import { Filter } from "mongodb";
import { StoredFile } from "../data/models";

export interface FileStore {

    getFiles(filter: Filter<any>): Promise<StoredFile[]>;

    getFile(key: string): Promise<StoredFile>;

    putFile(file: StoredFile): Promise<StoredFile>;

    removeFile(key: string): Promise<any>;
}
