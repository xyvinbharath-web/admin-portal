import { apiClient } from "@/lib/apiClient";

export interface BookingAdmin {
  _id: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  } | string;
  status: "booked" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export type EventStatus = "pending" | "approved" | "rejected";

export interface EventAdmin {
  _id: string;
  title: string;
  description?: string;
  date: string;
  capacity: number;
  bookings?: BookingAdmin[];
  bookingsCount?: number;
  status?: EventStatus;
  bannerUrl?: string;
  isFree?: boolean;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminEventsQuery {
  page?: number;
  limit?: number;
  q?: string;
  time?: "upcoming" | "past";
  status?: EventStatus | "";
}

export interface PaginatedEventsResponse {
  records: EventAdmin[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export async function getAdminEvents(params: AdminEventsQuery): Promise<PaginatedEventsResponse> {
  const response = await apiClient.get("/api/v1/admin/events", { params });
  return response.data.data;
}

export async function getAdminEvent(id: string): Promise<EventAdmin> {
  const response = await apiClient.get(`/api/v1/admin/events/${id}`);
  return response.data.data;
}

export async function updateAdminEvent(
  id: string,
  body: Partial<Pick<EventAdmin, "title" | "description" | "date" | "capacity" | "status">>
): Promise<EventAdmin> {
  const response = await apiClient.patch(`/api/v1/admin/events/${id}`, body);
  return response.data.data;
}

export async function deleteAdminEvent(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/events/${id}`);
}

export interface CreateAdminEventPayload {
  title: string;
  description?: string;
  date: string;
  capacity?: number;
  isFree?: boolean;
  price?: number;
  bannerUrl?: string;
}

export async function createAdminEvent(payload: CreateAdminEventPayload): Promise<EventAdmin> {
  const response = await apiClient.post("/api/v1/events", payload);
  return response.data.data;
}
