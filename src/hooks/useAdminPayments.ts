import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPaymentsQuery, getAdminPayments, PaginatedPaymentsResponse } from "@/services/admin/payments";

export function useAdminPayments(initialQuery?: AdminPaymentsQuery) {
  const [query, setQuery] = useState<AdminPaymentsQuery>({
    page: 1,
    limit: 10,
    ...(initialQuery || {}),
  });

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedPaymentsResponse>({
    queryKey: ["admin-payments", query],
    queryFn: () => getAdminPayments(query),
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    query,
    setQuery,
  };
}
