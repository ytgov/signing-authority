
import { StoredFile } from "../data/models";

export interface FileStore {

    getFile(key: string): Promise<StoredFile>

    putFile(file: StoredFile): Promise<StoredFile>

    removeFile(key: string): Promise<any>
}
