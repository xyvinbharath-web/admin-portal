"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { ToastProvider } from "@/components/ui/Toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastError } from "@/lib/toast";

export default function AdminEventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data: event, isLoading, isError, error, updateEvent, deleteEvent } = useAdminEvent(id);

  useEffect(() => {
    if (isError && error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toastError("Failed to load event");
    }
  }, [isError, error]);

  async function handleSave(formData: FormData) {
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "");
    const date = String(formData.get("date") || "");
    const capacityRaw = String(formData.get("capacity") || "0");
    const capacity = Number.parseInt(capacityRaw, 10) || 0;

    await updateEvent({ title, description, date, capacity });
  }

  async function handleDelete() {
    await deleteEvent();
    router.push("/admin/events");
  }

  if (isLoading || !event) {
    return (
      <ToastProvider>
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Loading event...</p>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/admin/events")}
              className="mb-1 text-xs text-slate-500 hover:text-slate-700"
            >
              6larr; Back to events
            </button>
            <h1 className="text-lg font-semibold">Event details</h1>
            <p className="text-xs text-slate-500">View and edit this event, and see its bookings.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete event
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <Card className="rounded-2xl border bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Event info</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await handleSave(formData);
                }}
              >
                <div className="space-y-1.5 text-xs">
                  <label className="block font-medium" htmlFor="title">
                    Title
                  </label>
                  <Input id="title" name="title" defaultValue={event.title} required />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="block font-medium" htmlFor="description">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={event.description || ""}
                    rows={4}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5 text-xs">
                    <label className="block font-medium" htmlFor="date">
                      Date & time
                    </label>
                    <Input
                      id="date"
                      name="date"
                      type="datetime-local"
                      defaultValue={event.date ? new Date(event.date).toISOString().slice(0, 16) : ""}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="block font-medium" htmlFor="capacity">
                      Capacity
                    </label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      min={0}
                      defaultValue={event.capacity ?? 0}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="sm" className="h-8 px-3 text-xs">
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Bookings</CardTitle>
              <div className="text-[11px] text-slate-500">
                Total bookings: <span className="font-semibold text-slate-700">{event.bookings?.length ?? 0}</span>
                {typeof event.capacity === "number" && event.capacity > 0 && (
                  <span>
                    {" "}/ {event.capacity}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Booked at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {!event.bookings || event.bookings.length === 0 ? (
                      <tr>
                        <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={3}>
                          No bookings yet.
                        </td>
                      </tr>
                    ) : (
                      event.bookings.map((b) => (
                        <tr key={b._id} className="text-[13px] text-slate-700">
                          <td className="px-3 py-2 align-top text-xs">
                            {typeof b.user === "string"
                              ? b.user
                              : `${b.user.name || "Unnamed"} (${b.user.email || b.user._id})`}
                          </td>
                          <td className="px-3 py-2 align-top text-xs">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                b.status === "booked"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top text-xs text-slate-500">
                            {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToastProvider>
  );
}
