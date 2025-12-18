import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminEventsQuery, getAdminEvents } from "@/services/admin/events";

export function useAdminEvents(initialQuery?: AdminEventsQuery) {
  const [query, setQuery] = useState<AdminEventsQuery>({
    page: 1,
    limit: 10,
    ...(initialQuery || {}),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-events", query],
    queryFn: () => getAdminEvents(query),
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
