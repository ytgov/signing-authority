import { Knex } from "knex";
import { StoredFile } from "../data/models";
import { FileStore } from "./file-store";

export class SqlFileStore implements FileStore {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async getFiles(filter: any): Promise<StoredFile[]> {
    let q = this.db("stored_files").select(
      "id",
      "filename",
      "file_size",
      "mime_type",
      "uploaded_by",
      "upload_date"
    );

    // Handle metadata.uploadedBy filter (from MongoDB GridFS query pattern)
    if (filter["metadata.uploadedBy"]) {
      q = q.where("uploaded_by", filter["metadata.uploadedBy"]);
    } else if (filter.uploaded_by) {
      q = q.where("uploaded_by", filter.uploaded_by);
    }

    const rows = await q;

    return rows.map((row: any) => ({
      _id: row.id,
      id: row.id,
      filename: row.filename,
      file_size: row.file_size,
      fileSize: row.file_size,
      mime_type: row.mime_type,
      mimeType: row.mime_type,
      content: Buffer.from(""),
      uploaded_by: row.uploaded_by,
      uploadedBy: row.uploaded_by,
      upload_date: row.upload_date,
      uploadDate: row.upload_date,
    })) as StoredFile[];
  }

  async getFile(key: string): Promise<StoredFile> {
    const numId = parseInt(key, 10);

    const row = await this.db("stored_files").where({ id: numId }).first();

    if (!row) {
      return {
        filename: "",
        file_size: 0,
        mime_type: "",
        content: Buffer.from([]),
      } as StoredFile;
    }

    return {
      _id: row.id,
      id: row.id,
      filename: row.filename,
      file_size: row.file_size,
      mime_type: row.mime_type,
      content: row.content,
      uploaded_by: row.uploaded_by,
      upload_date: row.upload_date,
    } as StoredFile;
  }

  async putFile(file: StoredFile): Promise<StoredFile> {
    const [inserted] = await this.db("stored_files")
      .insert({
        filename: file.filename,
        file_size: file.file_size,
        mime_type: file.mime_type,
        content: file.content,
        uploaded_by: file.uploaded_by,
        upload_date: new Date(),
      })
      .returning("id");

    const newId = typeof inserted === "object" ? inserted.id : inserted;
    file._id = newId;
    file.id = newId;

    return file;
  }

  async removeFile(key: string): Promise<any> {
    const numId = parseInt(key, 10);
    return this.db("stored_files").where({ id: numId }).del();
  }
}
