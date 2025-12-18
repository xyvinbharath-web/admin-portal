export type RoleEnum = "user" | "partner_request" | "partner" | "admin";

export type StatusEnum = "active" | "pending" | "suspended";

export type MembershipTierEnum = "free" | "gold";

export interface CreateAdminUserPayload {
  name: string;
  email?: string;
  phone?: string;
  role: RoleEnum;
  status?: StatusEnum;
  membershipTier?: MembershipTierEnum;
  password?: string;
}

export interface UserAdmin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: RoleEnum;
  status: StatusEnum;
  rewards?: number;
  membershipTier?: string;
  isSuspended?: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
  coursesCreatedCount?: number;
  eventBookingsCount?: number;
  subscription?: {
    plan?: string;
    status?: string;
    expiresAt?: string | null;
  };
}

export interface PaginatedResponse<T> extends PaginationMeta {
  records: T[];
}
