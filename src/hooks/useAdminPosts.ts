import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminPostsQuery,
  bulkUpdateAdminPostStatus,
  getAdminPosts,
  PaginatedPostsResponse,
  PostStatus,
  updateAdminPostStatus,
} from "@/services/admin/posts";
import { toastError, toastSuccess } from "@/lib/toast";

export function useAdminPosts(initialQuery?: AdminPostsQuery) {
  const queryClient = useQueryClient();

  const [query, setQuery] = useState<AdminPostsQuery>({
    page: 1,
    limit: 20,
    ...(initialQuery || {}),
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: bulkUpdateAdminPostStatus,
    onSuccess: () => {
      toastSuccess("Posts updated");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: () => {
      toastError("Failed to update posts");
    },
  });

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedPostsResponse>(
    {
      queryKey: ["admin-posts", query],
      queryFn: () => getAdminPosts(query),
    }
  );

  const updateStatusMutation = useMutation({
    mutationFn: updateAdminPostStatus,
    onSuccess: () => {
      toastSuccess("Post status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: () => {
      toastError("Failed to update post status");
    },
  });

  function setPage(page: number) {
    setQuery((prev) => ({ ...prev, page }));
  }

  function setStatusFilter(status: PostStatus | "") {
    setQuery((prev) => ({ ...prev, page: 1, status }));
  }

  function setSearch(q: string) {
    setQuery((prev) => ({ ...prev, page: 1, q }));
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
    setSearch,
    setLimit,
    updateStatus: updateStatusMutation.mutateAsync,
    updateStatusState: updateStatusMutation,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutateAsync,
    bulkUpdateStatusState: bulkUpdateStatusMutation,
  };
}
