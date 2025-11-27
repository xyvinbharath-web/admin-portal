import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminRedemptionsQuery,
  getAdminRedemptions,
  PaginatedRedemptionsResponse,
  RedemptionStatus,
  updateAdminRedemptionStatus,
} from "@/services/admin/rewards";
import { toastError, toastSuccess } from "@/lib/toast";

export function useAdminRedemptions(initialQuery?: AdminRedemptionsQuery) {
  const queryClient = useQueryClient();

  const [query, setQuery] = useState<AdminRedemptionsQuery>({
    page: 1,
    limit: 20,
    ...(initialQuery || {}),
  });

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedRedemptionsResponse>(
    {
      queryKey: ["admin-reward-redemptions", query],
      queryFn: () => getAdminRedemptions(query),
    }
  );

  const updateStatusMutation = useMutation({
    mutationFn: updateAdminRedemptionStatus,
    onSuccess: () => {
      toastSuccess("Redemption updated");
      queryClient.invalidateQueries({ queryKey: ["admin-reward-redemptions"] });
    },
    onError: () => {
      toastError("Failed to update redemption");
    },
  });

  function setPage(page: number) {
    setQuery((prev) => ({ ...prev, page }));
  }

  function setStatusFilter(status: RedemptionStatus | "") {
    setQuery((prev) => ({ ...prev, page: 1, status }));
  }

  function setLimit(limit: number) {
    setQuery((prev) => ({ ...prev, page: 1, limit }));
  }

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    query,
    setQuery,
    setPage,
    setStatusFilter,
    setLimit,
    updateStatus: updateStatusMutation.mutateAsync,
    updateStatusState: updateStatusMutation,
  };
}
