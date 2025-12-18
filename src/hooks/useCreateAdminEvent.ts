"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminEvent, type CreateAdminEventPayload, type EventAdmin } from "@/services/admin/events";

export function useCreateAdminEvent() {
  const queryClient = useQueryClient();

  return useMutation<EventAdmin, unknown, CreateAdminEventPayload>({
    mutationFn: (payload) => createAdminEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}
