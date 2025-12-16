export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // Optional because it's excluded from responses
  role: string;
  types?: string | null;
  status: "ACTIVE" | "INACTIVE";
  
  // Permission flags
  inserts: number; // 0 or 1
  updates: number; // 0 or 1
  deletes: number; // 0 or 1
  cancels: number; // 0 or 1
  
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  canInsert: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canCancel: boolean;
}