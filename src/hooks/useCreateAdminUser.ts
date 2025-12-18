"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminUser } from "@/services/admin/users";
import type { CreateAdminUserPayload, UserAdmin } from "@/types/admin";

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation<UserAdmin, unknown, CreateAdminUserPayload>({
    mutationFn: (payload) => createAdminUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
