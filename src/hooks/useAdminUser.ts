"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserAdmin, RoleEnum, StatusEnum } from "@/types/admin";
import { getAdminUser, patchAdminUserRole, patchAdminUserStatus, patchAdminUserMembership, deleteAdminUser } from "@/services/admin/users";
import { toastError, toastSuccess } from "@/lib/toast";

export function useAdminUser(id: string | undefined) {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => (id ? getAdminUser(id) : Promise.reject(new Error("Missing id"))),
    enabled: !!id,
  });

  const roleMutation = useMutation({
    mutationFn: (role: RoleEnum) => patchAdminUserRole(id as string, role),
    onSuccess: (updated) => {
      toastSuccess("Role updated");
      queryClient.setQueryData(["admin", "users", id], updated);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toastError(err?.response?.data?.message || "Failed to update role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminUser(id as string),
    onSuccess: () => {
      toastSuccess("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toastError(err?.response?.data?.message || "Failed to delete user");
    },
  });

  const membershipMutation = useMutation({
    mutationFn: (membershipTier: string) => patchAdminUserMembership(id as string, membershipTier),
    onSuccess: (updated: UserAdmin) => {
      toastSuccess("Membership updated");
      queryClient.setQueryData(["admin", "users", id], updated);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toastError(err?.response?.data?.message || "Failed to update membership");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: StatusEnum) => patchAdminUserStatus(id as string, status),
    onSuccess: (updated) => {
      toastSuccess("Status updated");
      queryClient.setQueryData(["admin", "users", id], updated);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toastError(err?.response?.data?.message || "Failed to update status");
    },
  });

  return {
    ...userQuery,
    updateRole: roleMutation.mutateAsync,
    updateStatus: statusMutation.mutateAsync,
    updateMembership: membershipMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    rolePending: roleMutation.isPending,
    statusPending: statusMutation.isPending,
    membershipPending: membershipMutation.isPending,
    deletePending: deleteMutation.isPending,
  };
}
