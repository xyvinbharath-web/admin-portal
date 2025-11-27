import apiClient from "@/lib/apiClient";
import type { PaginatedResponse, UserAdmin, RoleEnum, StatusEnum } from "@/types/admin";

interface UsersQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  role?: RoleEnum | "";
  status?: StatusEnum | "";
  sort?: string;
}

interface Wrapper<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getAdminUsers(params: UsersQueryParams): Promise<PaginatedResponse<UserAdmin>> {
  const res = await apiClient.get<Wrapper<PaginatedResponse<UserAdmin>>>("/api/v1/admin/users", {
    params,
  });
  return res.data.data;
}

export async function getAdminUser(id: string): Promise<UserAdmin> {
  const res = await apiClient.get<Wrapper<UserAdmin>>(`/api/v1/admin/users/${id}`);
  return res.data.data;
}

export async function patchAdminUserRole(id: string, role: RoleEnum): Promise<UserAdmin> {
  const res = await apiClient.patch<Wrapper<UserAdmin>>(`/api/v1/admin/users/${id}/role`, { role });
  return res.data.data;
}

export async function patchAdminUserStatus(id: string, status: StatusEnum): Promise<UserAdmin> {
  const res = await apiClient.patch<Wrapper<UserAdmin>>(`/api/v1/admin/users/${id}/status`, { status });
  return res.data.data;
}

export async function patchAdminUserMembership(id: string, membershipTier: string): Promise<UserAdmin> {
  const res = await apiClient.patch<Wrapper<UserAdmin>>(`/api/v1/admin/users/${id}/membership`, {
    membershipTier,
  });
  return res.data.data;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete<Wrapper<null>>(`/api/v1/admin/users/${id}`);
}

export type { UsersQueryParams };
