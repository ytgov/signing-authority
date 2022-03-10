
export interface StoredFile {
    id?: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    content: Buffer;
    uploadedBy?: string; //the user who uploaded this file
    user?: string; //the User for whom this FormB is for
    authorityID?: string; //the ID of the SigningAuth this relates to
    inEffect?: boolean; //a flag if this is the currenent SA (may be better tracked in the actual authority doc)
}
