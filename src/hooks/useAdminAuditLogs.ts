import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AdminAuditLogsQuery,
  getAdminAuditLogs,
  PaginatedAuditLogsResponse,
} from "@/services/admin/auditLogs";

export function useAdminAuditLogs(initialQuery?: AdminAuditLogsQuery) {
  const [query, setQuery] = useState<AdminAuditLogsQuery>({
    page: 1,
    limit: 20,
    ...(initialQuery || {}),
  });

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedAuditLogsResponse>({
    queryKey: ["admin-audit-logs", query],
    queryFn: () => getAdminAuditLogs(query),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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
