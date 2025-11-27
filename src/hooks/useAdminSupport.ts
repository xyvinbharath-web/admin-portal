import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminSupportQuery,
  getAdminSupportTickets,
  PaginatedSupportResponse,
  TicketStatus,
  getSupportTicketById,
  addSupportTicketReply,
  SupportTicketDetail,
} from "@/services/admin/support";
import { toastError, toastSuccess } from "@/lib/toast";
import { updateSupportTicketStatus } from "@/services/admin/support";

export function useAdminSupport(initialQuery?: AdminSupportQuery) {
  const [query, setQuery] = useState<AdminSupportQuery>({
    page: 1,
    limit: 10,
    ...(initialQuery || {}),
  });

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedSupportResponse>({
    queryKey: ["admin-support", query],
    queryFn: () => getAdminSupportTickets(query),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (input: { id: string; status: TicketStatus }) =>
      updateSupportTicketStatus(input.id, input.status),
    onSuccess: () => {
      toastSuccess("Ticket status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-support"] });
    },
    onError: () => {
      toastError("Failed to update ticket status");
    },
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    query,
    setQuery,
    updateStatus: updateStatusMutation.mutateAsync,
    updateStatusState: updateStatusMutation,
  };
}

export function useAdminSupportTicket(id: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<SupportTicketDetail>({
    queryKey: ["admin-support-ticket", id],
    queryFn: () => getSupportTicketById(id),
    enabled: !!id,
  });

  const replyMutation = useMutation({
    mutationFn: (message: string) => addSupportTicketReply(id, message),
    onSuccess: (updated) => {
      toastSuccess("Reply added");
      queryClient.setQueryData(["admin-support-ticket", id], updated);
      queryClient.invalidateQueries({ queryKey: ["admin-support"] });
    },
    onError: () => {
      toastError("Failed to add reply");
    },
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    addReply: replyMutation.mutateAsync,
    addReplyState: replyMutation,
  };
}
