import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAdminEvent, EventAdmin, getAdminEvent, updateAdminEvent } from "@/services/admin/events";
import { toastError, toastSuccess } from "@/lib/toast";

export function useAdminEvent(id: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<EventAdmin>({
    queryKey: ["admin-event", id],
    queryFn: () => getAdminEvent(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Pick<EventAdmin, "title" | "description" | "date" | "capacity">>) =>
      updateAdminEvent(id, payload),
    onSuccess: (updated) => {
      toastSuccess("Event updated");
      queryClient.setQueryData(["admin-event", id], updated);
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: () => {
      toastError("Failed to update event");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminEvent(id),
    onSuccess: () => {
      toastSuccess("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: () => {
      toastError("Failed to delete event");
    },
  });

  return {
    data,
    isLoading,
    isError,
    error,
    updateEvent: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
    updateStatus: updateMutation,
    deleteStatus: deleteMutation,
  };
}
