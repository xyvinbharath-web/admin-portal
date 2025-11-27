import { apiClient } from "@/lib/apiClient";

export type TicketStatus = "open" | "in_progress" | "closed";

export interface SupportTicketRow {
  _id: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
  };
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt?: string;
}

export interface TicketReply {
  _id: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
  };
  message: string;
  createdAt?: string;
}

export interface SupportTicketDetail extends SupportTicketRow {
  replies?: TicketReply[];
}

export interface AdminSupportQuery {
  page?: number;
  limit?: number;
  status?: TicketStatus | "";
}

export interface PaginatedSupportResponse {
  records: SupportTicketRow[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export async function getAdminSupportTickets(
  params: AdminSupportQuery
): Promise<PaginatedSupportResponse> {
  const response = await apiClient.get("/api/v1/admin/support/tickets", { params });
  return response.data.data;
}

export async function updateSupportTicketStatus(
  id: string,
  status: TicketStatus
): Promise<void> {
  await apiClient.patch(`/api/v1/admin/support/tickets/${id}/status`, { status });
}

export async function getSupportTicketById(id: string): Promise<SupportTicketDetail> {
  const response = await apiClient.get(`/api/v1/support/tickets/${id}`);
  return response.data.data;
}

export async function addSupportTicketReply(id: string, message: string): Promise<SupportTicketDetail> {
  const response = await apiClient.post(`/api/v1/support/tickets/${id}/replies`, { message });
  return response.data.data;
}
