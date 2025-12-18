"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginatedResponse, UserAdmin } from "@/types/admin";
import { getAdminUsers, type UsersQueryParams } from "@/services/admin/users";

interface UseAdminUsersResult {
  data?: PaginatedResponse<UserAdmin>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  query: UsersQueryParams;
  setQuery: (updater: (prev: UsersQueryParams) => UsersQueryParams) => void;
}

export function useAdminUsers(initial: UsersQueryParams = { page: 1, limit: 10 }) : UseAdminUsersResult {
  const [query, setQueryState] = useState<UsersQueryParams>(initial);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse<UserAdmin>>({
    queryKey: ["admin", "users", query],
    queryFn: () => getAdminUsers(query),
    // React Query v5: use placeholderData helper instead of keepPreviousData
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  function setQuery(updater: (prev: UsersQueryParams) => UsersQueryParams) {
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
