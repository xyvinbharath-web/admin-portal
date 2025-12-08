"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getPartnerEarningsAnalytics,
  type PaginatedPartnerEarnings,
  type PartnerEarningsQuery,
} from "@/services/admin/analytics";

interface UsePartnerEarningsResult {
  data?: PaginatedPartnerEarnings;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  query: PartnerEarningsQuery;
  setQuery: (updater: (prev: PartnerEarningsQuery) => PartnerEarningsQuery) => void;
}

export function usePartnerEarningsAnalytics(
  initial: PartnerEarningsQuery = { page: 1, limit: 10 }
): UsePartnerEarningsResult {
  const [query, setQueryState] = useState<PartnerEarningsQuery>(initial);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedPartnerEarnings>({
    queryKey: ["admin", "analytics", "partners-earnings", query],
    queryFn: () => getPartnerEarningsAnalytics(query),
    // React Query v5: use placeholderData helper instead of keepPreviousData
    placeholderData: keepPreviousData,
  });

  function setQuery(
    updater: (prev: PartnerEarningsQuery) => PartnerEarningsQuery
  ) {
    setQueryState((prev) => updater(prev));
  }

  return {
    data,
    isLoading,
    isError,
    refetch,
    query,
    setQuery,
  };
}
