export class BaseEntity {
  id?: number;
  // Keep _id as alias for backward compatibility during transition
  _id?: number;
}

// Shared types used across multiple models
export interface ReviewResults {
  date: Date;
  name: string;
  user_id: number;
  result: ReviewResultType;
  note?: string;
}

export enum ReviewResultType {
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface WorkflowStep {
  id?: number;
  position_group_id?: number;
  position_id?: number;
  authority_id?: number;
  step_type: string;
  outcome: string;
  user_id?: number;
  user_name?: string;
  note?: string;
  file_id?: number;
  step_date: Date;
}

export * from "./authority";
export * from "./file";
export * from "./user";
export * from "./operational-restriction";
export * from "./position";
export * from "./position-group";
export * from "./department";
export * from "./employee";
