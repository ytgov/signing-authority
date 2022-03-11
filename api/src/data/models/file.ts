
export interface StoredFile {
    id?: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    content: Buffer;
    uploadedBy?: string; //the user who uploaded this file
}

export interface FormB {
    id?: string;
    user?: string; //the User for whom this FormB is for
    department:string;
    lines: FormBLine[];

    authorityID?: string; //the ID of the SigningAuth this relates to
    inEffect?: boolean; //a flag if this is the currenent SA (may be better tracked in the actual authority doc)

    currentFile?: StoredFile
}

export interface FormBLine {
    coding:string;
    description: string;
    value: number;
}


export interface FormA {
    
    uploadedBy?: string; //the user who uploaded this file
    authorityID?: string; //the ID of the SigningAuth this relates to
    inEffect?: boolean; //a flag if this is the currenent SA (may be better tracked in the actual authority doc)

    currentFile?: StoredFile
}
