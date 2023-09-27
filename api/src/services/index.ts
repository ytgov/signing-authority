export * from "./codesearch-service";
export * from "./directory-service";
export * from "./email-service";
export * from "./file-service";
export * from "./generic-service";
export * from "./quest-service";
export * from "./user-service";
export * from "./department-service";
export * from "./limit-service";
export * from "./vroozi-service";
export * from "./yesnet-service";

export interface QueryStatement {
  field: string;
  fields: [];
  operator: string;
  value: any;
}

export interface SortStatement {
  field: string;
  direction: SortDirection;
}

export enum SortDirection {
  ASCENDING = "asc",
  DESCENDING = "desc",
}
