"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/types/admin";
import { getAdminCourses, type CourseAdmin, type CoursesQueryParams } from "@/services/admin/courses";

interface UseAdminCoursesResult {
  data?: PaginatedResponse<CourseAdmin>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  query: CoursesQueryParams;
  setQuery: (updater: (prev: CoursesQueryParams) => CoursesQueryParams) => void;
}

export function useAdminCourses(initial: CoursesQueryParams = { page: 1, limit: 10 }): UseAdminCoursesResult {
  const [query, setQueryState] = useState<CoursesQueryParams>(initial);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse<CourseAdmin>>({
    queryKey: ["admin", "courses", query],
    queryFn: () => getAdminCourses(query),
    // React Query v5: use placeholderData helper instead of keepPreviousData
    placeholderData: keepPreviousData,
  });

  function setQuery(updater: (prev: CoursesQueryParams) => CoursesQueryParams) {
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
