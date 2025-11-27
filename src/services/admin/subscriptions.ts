import { apiClient } from "@/lib/apiClient";

export type SubscriptionPlan = "free" | "gold";
export type SubscriptionStatus = "active" | "expired" | "canceled";

export interface AdminSubscriptionRow {
  _id: string;
  name?: string;
  email?: string;
  subscription?: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiresAt?: string | null;
  };
}

export interface AdminSubscriptionsQuery {
  page?: number;
  limit?: number;
  plan?: SubscriptionPlan | "";
  status?: SubscriptionStatus | "";
}

export interface PaginatedSubscriptionsResponse {
  records: AdminSubscriptionRow[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export async function getAdminSubscriptions(
  params: AdminSubscriptionsQuery
): Promise<PaginatedSubscriptionsResponse> {
  const response = await apiClient.get("/api/v1/admin/subscriptions", { params });
  return response.data.data;
}

export async function patchUserSubscription(
  userId: string,
  body: Partial<{
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiresAt: string | null;
  }>
): Promise<void> {
  await apiClient.patch(`/api/v1/admin/users/${userId}/subscription`, body);
}
