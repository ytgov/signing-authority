
export interface StoredFile {
    id?: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    content: Buffer;
}
