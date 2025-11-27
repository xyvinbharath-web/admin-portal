import { apiClient } from "@/lib/apiClient";

export type PaymentStatus = "pending" | "succeeded" | "failed";

export interface PaymentAdminRow {
  _id: string;
  user: string;
  amount: number;
  currency: string;
  plan: "gold";
  status: PaymentStatus;
  createdAt?: string;
}

export interface AdminPaymentsQuery {
  page?: number;
  limit?: number;
  plan?: "gold" | "";
  status?: PaymentStatus | "";
}

export interface PaginatedPaymentsResponse {
  records: PaymentAdminRow[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export async function getAdminPayments(
  params: AdminPaymentsQuery
): Promise<PaginatedPaymentsResponse> {
  const response = await apiClient.get("/api/v1/admin/payments", { params });
  return response.data.data;
}
