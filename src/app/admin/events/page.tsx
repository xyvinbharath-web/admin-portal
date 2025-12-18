"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAdminEvents } from "@/hooks/useAdminEvents";
import {
  deleteAdminEvent,
  type EventAdmin,
  updateAdminEvent,
  type EventStatus,
} from "@/services/admin/events";
import { toastError, toastSuccess } from "@/lib/toast";
import { useCreateAdminEvent } from "@/hooks/useCreateAdminEvent";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import type { BookingAdminRow, BookingStatus } from "@/services/admin/bookings";

export default function EventsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"events" | "bookings">("events");
  const { data, isLoading, query, setQuery } = useAdminEvents({ page: 1, limit: 10 });
  const [search, setSearch] = useState(query.q ?? "");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createCapacity, setCreateCapacity] = useState("");
  const [createIsFree, setCreateIsFree] = useState(true);
  const [createPrice, setCreatePrice] = useState("");

  const createEventMutation = useCreateAdminEvent();

  // Bookings tab state
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    query: bookingsQuery,
    setQuery: setBookingsQuery,
    updateStatus,
    updateStatusState,
  } = useAdminBookings({ page: 1, limit: 10 });

  const [bookingSearch, setBookingSearch] = useState(bookingsQuery.q ?? "");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>(bookingsQuery.status ?? "");

  // Debounced search for events
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery((prev) => ({ ...prev, page: 1, q: search || undefined }));
    }, 400);
    return () => clearTimeout(id);
  }, [search, setQuery]);

  // Debounced search for bookings
  useEffect(() => {
    const id = setTimeout(() => {
      setBookingsQuery((prev) => ({ ...prev, page: 1, q: bookingSearch || undefined }));
    }, 400);
    return () => clearTimeout(id);
  }, [bookingSearch, setBookingsQuery]);

  function handlePageChange(page: number) {
    setQuery((prev) => ({ ...prev, page }));
  }

  function handleLimitChange(limit: number) {
    setQuery((prev) => ({ ...prev, page: 1, limit }));
  }

  function handleTimeChange(value: string) {
    setTimeFilter(value);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      time: (value || undefined) as "upcoming" | "past" | undefined,
    }));
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!createTitle.trim() || !createDate) return;

    try {
      await createEventMutation.mutateAsync({
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        date: new Date(createDate).toISOString(),
        capacity: createCapacity ? Number(createCapacity) : undefined,
        isFree: createIsFree,
        price: !createIsFree && createPrice ? Number(createPrice) : undefined,
      });
      toastSuccess("Event created");
      setCreateOpen(false);
      setCreateTitle("");
      setCreateDescription("");
      setCreateDate("");
      setCreateCapacity("");
      setCreateIsFree(true);
      setCreatePrice("");
      setQuery((prev) => ({ ...prev }));
    } catch {
      toastError("Failed to create event");
    }
  }

  async function handleBookingStatusUpdate(booking: BookingAdminRow, status: BookingStatus) {
    await updateStatus({ id: booking._id, status });
  }

  function handleStatusChangeFilter(value: string) {
    setStatusFilter(value);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status: (value || undefined) as EventStatus | "" | undefined,
    }));
  }

  function handleBookingsPageChange(page: number) {
    setBookingsQuery((prev) => ({ ...prev, page }));
  }

  function handleBookingsLimitChange(limit: number) {
    setBookingsQuery((prev) => ({ ...prev, page: 1, limit }));
  }

  function handleBookingsStatusChange(value: string) {
    setBookingStatusFilter(value);
    setBookingsQuery((prev) => ({
      ...prev,
      page: 1,
      status: (value || undefined) as BookingStatus | undefined,
    }));
  }

  const pagination = data
    ? {
        page: (data as any).page,
        limit: (data as any).limit,
        totalPages: (data as any).totalPages,
        totalRecords: (data as any).totalRecords,
      }
    : undefined;

  const bookingsPagination = bookingsData
    ? {
        page: (bookingsData as any).page,
        limit: (bookingsData as any).limit,
        totalPages: (bookingsData as any).totalPages,
        totalRecords: (bookingsData as any).totalRecords,
      }
    : undefined;

  function getStatus(ev: EventAdmin): "Upcoming" | "Past" {
    const now = new Date();
    const date = new Date(ev.date);
    return date >= now ? "Upcoming" : "Past";
  }

  async function handleDelete(eventId: string) {
    try {
      setActionPendingId(eventId);
      await deleteAdminEvent(eventId);
      toastSuccess("Event deleted");
      setQuery((prev) => ({ ...prev }));
    } catch {
      toastError("Failed to delete event");
    } finally {
      setActionPendingId(null);
    }
  }

  async function handleStatusUpdate(ev: EventAdmin, status: EventStatus) {
    try {
      setActionPendingId(ev._id);
      await updateAdminEvent(ev._id, { status });
      toastSuccess("Event updated");
      setQuery((prev) => ({ ...prev }));
    } catch {
      toastError("Failed to update event");
    } finally {
      setActionPendingId(null);
    }
  }

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Events & bookings</h1>
            <p className="text-xs text-slate-500">Manage live events, sessions, and RSVPs.</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Create event
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`rounded-full px-3 py-1 font-medium ${
              activeTab === "events"
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Events
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`rounded-full px-3 py-1 font-medium ${
              activeTab === "bookings"
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Bookings
          </button>
        </div>

        {/* Filters for active tab */}
        {activeTab === "events" ? (
          <Card className="rounded-2xl border bg-white">
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <Input
                  placeholder="Search by event title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  className="h-9 rounded-md border bg-white px-2"
                  value={timeFilter}
                  onChange={(e) => handleTimeChange(e.target.value)}
                >
                  <option value="">All dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
                <select
                  className="h-9 rounded-md border bg-white px-2"
                  value={statusFilter}
                  onChange={(e) => handleStatusChangeFilter(e.target.value)}
                >
                  <option value="">All approval</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border bg-white">
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <Input
                  placeholder="Search by event title or user name/email..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  className="h-9 rounded-md border bg-white px-2"
                  value={bookingStatusFilter}
                  onChange={(e) => handleBookingsStatusChange(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="booked">Booked</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content for active tab */}
        {activeTab === "events" ? (
          <Card className="rounded-2xl border bg-white">
            <CardContent className="p-0">
              {/* Mobile: cards */}
              <div className="space-y-2 p-3 text-xs md:hidden">
                {isLoading ? (
                  <div className="rounded-lg border bg-white p-3 text-slate-500">
                    Loading events...
                  </div>
                ) : !data || (data as any).records.length === 0 ? (
                  <div className="rounded-lg border bg-white p-3 text-slate-500">
                    No events found. Try adjusting your search or filters.
                  </div>
                ) : (
                  (data as any).records.map((ev: EventAdmin) => (
                    <div
                      key={ev._id}
                      className="rounded-xl border bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-slate-900 line-clamp-2">
                            {ev.title}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {new Date(ev.date).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            getStatus(ev) === "Upcoming"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {getStatus(ev)}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-slate-400">
                            Capacity
                          </div>
                          <div>{ev.capacity || 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-slate-400">
                            Bookings
                          </div>
                          <div>
                            {ev.bookingsCount ?? (ev.bookings ? ev.bookings.length : 0)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-col gap-2">
                        <select
                          className="h-8 w-full rounded-md border bg-white px-2 text-[11px] capitalize"
                          value={(ev.status || "pending") as EventStatus}
                          disabled={actionPendingId === ev._id}
                          onChange={async (e) =>
                            handleStatusUpdate(ev, e.target.value as EventStatus)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 flex-1 px-2 text-[11px]"
                            onClick={() => router.push(`/admin/events/${ev._id}`)}
                          >
                            View
                          </Button>
                          <ConfirmDialog
                            title="Delete event"
                            description="This will permanently remove this event and its bookings. This action cannot be undone."
                            destructive
                            confirmLabel={actionPendingId === ev._id ? "Deleting..." : "Delete"}
                            onConfirm={async () => {
                              await handleDelete(ev._id);
                            }}
                            trigger={
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 flex-1 px-2 text-[11px]"
                                disabled={actionPendingId === ev._id}
                              >
                                Delete
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Title</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Capacity</th>
                        <th className="px-3 py-2">Bookings</th>
                        <th className="px-3 py-2">Schedule</th>
                        <th className="px-3 py-2">Approval</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {isLoading && (
                        <tr>
                          <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={6}>
                            Loading events...
                          </td>
                        </tr>
                      )}

                      {!isLoading && (!data || (data as any).records.length === 0) && (
                        <tr>
                          <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={6}>
                            No events found. Try adjusting your search or filters.
                          </td>
                        </tr>
                      )}

                      {!isLoading &&
                        data &&
                        (data as any).records.map((ev: EventAdmin) => (
                          <tr key={ev._id} className="text-[13px] text-slate-700">
                            <td className="px-3 py-2 align-top">
                              <div className="max-w-xs truncate font-medium">{ev.title}</div>
                            </td>
                            <td className="px-3 py-2 align-top text-xs">
                              {new Date(ev.date).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 align-top text-xs">
                              {ev.capacity || 0}
                            </td>
                            <td className="px-3 py-2 align-top text-xs">
                              {ev.bookingsCount ?? (ev.bookings ? ev.bookings.length : 0)}
                            </td>
                            <td className="px-3 py-2 align-top">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  getStatus(ev) === "Upcoming"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {getStatus(ev)}
                              </span>
                            </td>
                            <td className="px-3 py-2 align-top text-xs">
                              <select
                                className="h-7 rounded-md border bg-white px-2 text-[11px] capitalize"
                                value={(ev.status || "pending") as EventStatus}
                                disabled={actionPendingId === ev._id}
                                onChange={async (e) =>
                                  handleStatusUpdate(ev, e.target.value as EventStatus)
                                }
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 align-top text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={() => router.push(`/admin/events/${ev._id}`)}
                                >
                                  View
                                </Button>
                                <ConfirmDialog
                                  title="Delete event"
                                  description="This will permanently remove this event and its bookings. This action cannot be undone."
                                  destructive
                                  confirmLabel={actionPendingId === ev._id ? "Deleting..." : "Delete"}
                                  onConfirm={async () => {
                                    await handleDelete(ev._id);
                                  }}
                                  trigger={
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="h-7 px-2 text-[11px]"
                                      disabled={actionPendingId === ev._id}
                                    >
                                      Delete
                                    </Button>
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-slate-500">
                    <div>
                      Page {pagination.page} of {pagination.totalPages} • {pagination.totalRecords} events
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        Next
                      </Button>
                      <select
                        className="h-7 rounded-md border bg-white px-2"
                        value={pagination.limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                      >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border bg-white">
            <CardContent className="p-0">
              {/* Mobile: cards */}
              <div className="space-y-2 p-3 text-xs md:hidden">
                {bookingsLoading ? (
                  <div className="rounded-lg border bg-white p-3 text-slate-500">
                    Loading bookings...
                  </div>
                ) : !bookingsData || (bookingsData as any).records.length === 0 ? (
                  <div className="rounded-lg border bg-white p-3 text-slate-500">
                    No bookings found. Try adjusting your search or filters.
                  </div>
                ) : (
                  (bookingsData as any).records.map((b: BookingAdminRow) => (
                    <div
                      key={b._id}
                      className="rounded-xl border bg-white p-3 shadow-sm"
                    >
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        Event
                      </div>
                      <button
                        type="button"
                        className="mt-0.5 line-clamp-2 text-[11px] font-medium text-sky-700 hover:underline"
                        onClick={() => router.push(`/admin/events/${b.eventId}`)}
                      >
                        {b.eventTitle || b.eventId}
                      </button>

                      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-slate-400">
                            User
                          </div>
                          {b.userId ? (
                            <button
                              type="button"
                              className="mt-0.5 line-clamp-2 text-left text-sky-700 hover:underline"
                              onClick={() => router.push(`/admin/users/${b.userId}`)}
                            >
                              {b.userName || b.userEmail || b.userId}
                            </button>
                          ) : (
                            <div className="mt-0.5 text-slate-500">Unknown user</div>
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-slate-400">
                            Status
                          </div>
                          <select
                            className="mt-0.5 h-7 w-full rounded-md border bg-white px-2 text-[11px]"
                            value={b.status}
                            disabled={updateStatusState.isPending}
                            onChange={async (e) => {
                              await handleBookingStatusUpdate(b, e.target.value as BookingStatus);
                            }}
                          >
                            <option value="booked">Booked</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-700">
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          Booked at
                        </div>
                        <div>
                          {b.createdAt
                            ? new Date(b.createdAt).toLocaleString()
                            : "-"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {bookingsPagination && bookingsPagination.totalPages > 1 && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Page {bookingsPagination.page} of {bookingsPagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        disabled={bookingsPagination.page === 1}
                        onClick={() => handleBookingsPageChange(bookingsPagination.page - 1)}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        disabled={bookingsPagination.page === bookingsPagination.totalPages}
                        onClick={() => handleBookingsPageChange(bookingsPagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Event</th>
                        <th className="px-3 py-2">User</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Booked at</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bookingsLoading && (
                        <tr>
                          <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={5}>
                            Loading bookings...
                          </td>
                        </tr>
                      )}

                      {!bookingsLoading && (!bookingsData || (bookingsData as any).records.length === 0) && (
                        <tr>
                          <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={5}>
                            No bookings found. Try adjusting your search or filters.
                          </td>
                        </tr>
                      )}

                      {!bookingsLoading &&
                        bookingsData &&
                        (bookingsData as any).records.map((b: BookingAdminRow) => (
                          <tr key={b._id} className="text-[13px] text-slate-700">
                            <td className="px-3 py-2 align-top text-xs">
                              <button
                                type="button"
                                className="max-w-xs truncate font-medium text-left text-sky-700 hover:underline"
                                onClick={() => router.push(`/admin/events/${b.eventId}`)}
                              >
                                {b.eventTitle || b.eventId}
                              </button>
                            </td>
                            <td className="px-3 py-2 align-top text-xs">
                              {b.userId ? (
                                <button
                                  type="button"
                                  className="max-w-xs truncate text-left text-sky-700 hover:underline"
                                  onClick={() => router.push(`/admin/users/${b.userId}`)}
                                >
                                  {b.userName || b.userEmail || b.userId}
                                </button>
                              ) : (
                                <span className="text-slate-500">Unknown user</span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top text-xs">
                              <select
                                className="h-7 rounded-md border bg-white px-2 text-[11px]"
                                value={b.status}
                                disabled={updateStatusState.isPending}
                                onChange={async (e) => {
                                  await handleBookingStatusUpdate(b, e.target.value as BookingStatus);
                                }}
                              >
                                <option value="booked">Booked</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 align-top text-xs text-slate-500">
                              {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
                            </td>
                            <td className="px-3 py-2 align-top text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={() => router.push(`/admin/events/${b.eventId}`)}
                                >
                                  View event
                                </Button>
                                {b.userId && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-[11px]"
                                    onClick={() => router.push(`/admin/users/${b.userId}`)}
                                  >
                                    View user
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {bookingsPagination && bookingsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-slate-500">
                    <div>
                      Page {bookingsPagination.page} of {bookingsPagination.totalPages} • {bookingsPagination.totalRecords} bookings
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        disabled={bookingsPagination.page === 1}
                        onClick={() => handleBookingsPageChange(bookingsPagination.page - 1)}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        disabled={bookingsPagination.page === bookingsPagination.totalPages}
                        onClick={() => handleBookingsPageChange(bookingsPagination.page + 1)}
                      >
                        Next
                      </Button>
                      <select
                        className="h-7 rounded-md border bg-white px-2"
                        value={bookingsPagination.limit}
                        onChange={(e) => handleBookingsLimitChange(Number(e.target.value))}
                      >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
              <h2 className="text-sm font-semibold text-slate-900">Create event</h2>
              <p className="mb-4 mt-1 text-xs text-slate-500">Create a new event from the admin panel.</p>
              <form className="space-y-3" onSubmit={handleCreateSubmit}>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Title</label>
                  <Input
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Date & time</label>
                    <Input
                      type="datetime-local"
                      value={createDate}
                      onChange={(e) => setCreateDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Capacity</label>
                    <Input
                      type="number"
                      min={0}
                      value={createCapacity}
                      onChange={(e) => setCreateCapacity(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400">Leave blank or 0 for unlimited seats.</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="create-event-free"
                      type="checkbox"
                      className="h-4 w-4 rounded border"
                      checked={createIsFree}
                      onChange={(e) => setCreateIsFree(e.target.checked)}
                    />
                    <label htmlFor="create-event-free" className="text-xs font-medium text-slate-700">
                      Free event
                    </label>
                  </div>
                  {!createIsFree && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Price (₹)</label>
                      <Input
                        type="number"
                        min={0}
                        value={createPrice}
                        onChange={(e) => setCreatePrice(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateOpen(false)}
                    disabled={createEventMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createEventMutation.isPending}>
                    {createEventMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
