import { apiClient } from "@/lib/apiClient";

export type PostStatus = "pending" | "approved" | "rejected";

export interface AdminPostRow {
  _id: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
  } | null;
  content: string;
  image?: string;
  status: PostStatus;
  createdAt?: string;
}

export interface AdminPostsQuery {
  page?: number;
  limit?: number;
  status?: PostStatus | "";
  q?: string;
}

export interface PaginatedPostsResponse {
  records: AdminPostRow[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export async function getAdminPosts(
  params: AdminPostsQuery
): Promise<PaginatedPostsResponse> {
  const response = await apiClient.get("/api/v1/admin/posts", { params });
  return response.data.data;
}

export async function updateAdminPostStatus(input: {
  id: string;
  status: PostStatus;
}): Promise<AdminPostRow> {
  const { id, status } = input;
  const response = await apiClient.patch(`/api/v1/admin/posts/${id}/status`, { status });
  return response.data.data;
}

export async function bulkUpdateAdminPostStatus(input: {
  ids: string[];
  status: PostStatus;
}): Promise<{ matchedCount: number; modifiedCount: number }> {
  const response = await apiClient.patch(`/api/v1/admin/posts/bulk-status`, input);
  return response.data.data;
}
