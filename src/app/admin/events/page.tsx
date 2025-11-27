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

export default function EventsPage() {
  const router = useRouter();
  const { data, isLoading, query, setQuery } = useAdminEvents({ page: 1, limit: 10 });
  const [search, setSearch] = useState(query.q ?? "");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery((prev) => ({ ...prev, page: 1, q: search || undefined }));
    }, 400);
    return () => clearTimeout(id);
  }, [search, setQuery]);

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

  function handleStatusChangeFilter(value: string) {
    setStatusFilter(value);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status: (value || undefined) as EventStatus | "" | undefined,
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
            <h1 className="text-lg font-semibold">Events</h1>
            <p className="text-xs text-slate-500">Manage live events, sessions, and RSVPs.</p>
          </div>
        </div>

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
      </div>
    </ToastProvider>
  );
}
