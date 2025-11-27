import { apiClient } from "@/lib/apiClient";

export type RedemptionStatus = "pending" | "approved" | "rejected" | "paid";

export interface RewardRedemptionRow {
  _id: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  points: number;
  amount: number;
  status: RedemptionStatus;
  payoutMethod?: string;
  note?: string;
  createdAt?: string;
}

export interface AdminRedemptionsQuery {
  page?: number;
  limit?: number;
  status?: RedemptionStatus | "";
}

export interface PaginatedRedemptionsResponse {
  records: RewardRedemptionRow[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export async function getAdminRedemptions(
  params: AdminRedemptionsQuery
): Promise<PaginatedRedemptionsResponse> {
  const response = await apiClient.get("/api/v1/admin/rewards/redemptions", { params });
  return response.data.data;
}

export async function updateAdminRedemptionStatus(input: {
  id: string;
  status: RedemptionStatus;
}): Promise<RewardRedemptionRow> {
  const { id, status } = input;
  const response = await apiClient.patch(`/api/v1/admin/rewards/redemptions/${id}`, { status });
  return response.data.data;
}
