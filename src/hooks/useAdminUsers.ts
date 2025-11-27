"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "users", query],
    queryFn: () => getAdminUsers(query),
    keepPreviousData: true,
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
