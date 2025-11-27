import { apiClient } from "@/lib/apiClient";

export type BookingStatus = "booked" | "cancelled";

export interface BookingAdminRow {
  _id: string;
  eventId: string;
  eventTitle: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  status: BookingStatus;
  createdAt?: string;
}

export interface AdminBookingsQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus | "";
  q?: string;
  event?: string;
  user?: string;
}

export interface PaginatedBookingsResponse {
  records: BookingAdminRow[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export async function getAdminBookings(params: AdminBookingsQuery): Promise<PaginatedBookingsResponse> {
  const response = await apiClient.get("/api/v1/admin/bookings", { params });
  return response.data.data;
}

export async function updateAdminBookingStatus(id: string, status: BookingStatus): Promise<void> {
  await apiClient.patch(`/api/v1/admin/bookings/${id}`, { status });
}
