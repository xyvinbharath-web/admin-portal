import { apiClient } from "@/lib/apiClient";

export interface AuditLogRow {
  _id: string;
  userId: string;
  actorId?: string;
  action: string;
  meta?: Record<string, any> | null;
  ip?: string;
  createdAt?: string;
}

export interface AdminAuditLogsQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogsResponse {
  records: AuditLogRow[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export async function getAdminAuditLogs(
  params: AdminAuditLogsQuery
): Promise<PaginatedAuditLogsResponse> {
  const response = await apiClient.get("/api/v1/admin/audit-logs", { params });
  return response.data.data;
}
