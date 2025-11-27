import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminSubscriptionsQuery,
  AdminSubscriptionRow,
  getAdminSubscriptions,
  PaginatedSubscriptionsResponse,
  patchUserSubscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/services/admin/subscriptions";
import { toastError, toastSuccess } from "@/lib/toast";

export function useAdminSubscriptions(initialQuery?: AdminSubscriptionsQuery) {
  const [query, setQuery] = useState<AdminSubscriptionsQuery>({
    page: 1,
    limit: 10,
    ...(initialQuery || {}),
  });

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedSubscriptionsResponse>({
    queryKey: ["admin-subscriptions", query],
    queryFn: () => getAdminSubscriptions(query),
  });

  const patchMutation = useMutation({
    mutationFn: (input: {
      userId: string;
      plan?: SubscriptionPlan;
      status?: SubscriptionStatus;
      expiresAt?: string | null;
    }) => patchUserSubscription(input.userId, {
      plan: input.plan,
      status: input.status,
      expiresAt: input.expiresAt,
    }),
    onSuccess: () => {
      toastSuccess("Subscription updated");
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    },
    onError: () => {
      toastError("Failed to update subscription");
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
    patchSubscription: patchMutation.mutateAsync,
    patchState: patchMutation,
  };
}
