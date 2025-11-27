import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminBookingsQuery, BookingAdminRow, BookingStatus, getAdminBookings, PaginatedBookingsResponse, updateAdminBookingStatus } from "@/services/admin/bookings";
import { toastError, toastSuccess } from "@/lib/toast";

export function useAdminBookings(initialQuery?: AdminBookingsQuery) {
  const [query, setQuery] = useState<AdminBookingsQuery>({
    page: 1,
    limit: 10,
    ...(initialQuery || {}),
  });

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedBookingsResponse>({
    queryKey: ["admin-bookings", query],
    queryFn: () => getAdminBookings(query),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (input: { id: string; status: BookingStatus }) =>
      updateAdminBookingStatus(input.id, input.status),
    onSuccess: () => {
      toastSuccess("Booking updated");
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: () => {
      toastError("Failed to update booking");
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
    updateStatus: updateStatusMutation.mutateAsync,
    updateStatusState: updateStatusMutation,
  };
}
