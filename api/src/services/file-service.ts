import { StoredFile } from "../data/models";
import { FileStore } from "../utils/file-store";

export class FileService {
  readonly fileStore: FileStore;

  constructor(fileStore: FileStore) {
    this.fileStore = fileStore;
  }

  storeFile(file: StoredFile): Promise<StoredFile> {
    return this.fileStore.putFile(file);
  }

  retrieveFile(key: string): Promise<StoredFile> {
    return this.fileStore.getFile(key);
  }

  removeFile(key: string): Promise<any> {
    return this.fileStore.removeFile(key);
  }
}
