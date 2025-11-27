"use client";

import { useRouter } from "next/navigation";
import { useAdminSupport } from "@/hooks/useAdminSupport";
import { TicketStatus } from "@/services/admin/support";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  const router = useRouter();
  const { data, isLoading, isError, query, setQuery, updateStatus } = useAdminSupport({
    page: 1,
    limit: 10,
  });

  const records = data?.records || [];

  const handleStatusFilterChange = (value: string) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status: (value || undefined) as TicketStatus | undefined,
    }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleStatusChange = async (id: string, status: TicketStatus) => {
    await updateStatus({ id, status });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Support</h2>
        <p className="text-sm text-slate-500">Manage support tickets and conversations.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Status</span>
          <select
            className="h-8 w-40 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700"
            value={query.status || ""}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Tickets
        </div>

        {/* Mobile: cards */}
        <div className="space-y-2 p-3 text-xs md:hidden">
          {isLoading ? (
            <div className="rounded-lg border bg-white p-3 text-slate-500">
              Loading tickets...
            </div>
          ) : isError ? (
            <div className="rounded-lg border bg-white p-3 text-red-500">
              Failed to load tickets.
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-lg border bg-white p-3 text-slate-500">
              No tickets found.
            </div>
          ) : (
            records.map((t) => (
              <div
                key={t._id}
                className="rounded-xl border bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      type="button"
                      className="text-[11px] font-medium text-sky-700 hover:underline"
                      onClick={() => t.user && router.push(`/admin/users/${t.user._id}`)}
                    >
                      {t.user?.name || "Unknown"}
                    </button>
                    <div className="text-[11px] text-slate-500">{t.user?.email}</div>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] font-medium text-sky-700 hover:underline"
                    onClick={() => router.push(`/admin/support/${t._id}`)}
                  >
                    View
                  </button>
                </div>
                <div className="mt-2 text-xs">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                    Subject
                  </div>
                  <div className="text-[11px] font-medium text-slate-800">{t.subject}</div>
                  <div className="mt-1 text-[11px] text-slate-600 line-clamp-3">
                    {t.message}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Status
                    </div>
                    <div className="capitalize">{t.status.replace("_", " ")}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Created
                    </div>
                    <div>
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={t.status === "open"}
                    onClick={() => handleStatusChange(t._id, "open")}
                  >
                    Mark open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={t.status === "in_progress"}
                    onClick={() => handleStatusChange(t._id, "in_progress")}
                  >
                    In progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={t.status === "closed"}
                    onClick={() => handleStatusChange(t._id, "closed")}
                  >
                    Closed
                  </Button>
                </div>
              </div>
            ))
          )}
          {data && data.totalPages > 1 && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Page {data.page} of {data.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={data.page <= 1}
                  onClick={() => handlePageChange(data.page - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={data.page >= data.totalPages}
                  onClick={() => handlePageChange(data.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block">
          {isLoading ? (
            <div className="p-4 text-sm text-slate-500">Loading tickets...</div>
          ) : isError ? (
            <div className="p-4 text-sm text-red-500">Failed to load tickets.</div>
          ) : records.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No tickets found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">User</th>
                    <th className="px-4 py-2 font-medium">Subject</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Created</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((t) => (
                    <tr key={t._id} className="border-t text-slate-700">
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          className="text-xs text-sky-700 hover:underline"
                          onClick={() => t.user && router.push(`/admin/users/${t.user._id}`)}
                        >
                          {t.user?.name || "Unknown"}
                        </button>
                        <div className="text-[11px] text-slate-500">{t.user?.email}</div>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <button
                          type="button"
                          className="font-medium text-sky-700 hover:underline"
                          onClick={() => router.push(`/admin/support/${t._id}`)}
                        >
                          {t.subject}
                        </button>
                        <div className="line-clamp-2 text-[11px] text-slate-500">{t.message}</div>
                      </td>
                      <td className="px-4 py-2 text-xs capitalize">{t.status.replace("_", " ")}</td>
                      <td className="px-4 py-2 text-xs text-slate-500">
                        {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            disabled={t.status === "open"}
                            onClick={() => handleStatusChange(t._id, "open")}
                          >
                            Mark open
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            disabled={t.status === "in_progress"}
                            onClick={() => handleStatusChange(t._id, "in_progress")}
                          >
                            In progress
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            disabled={t.status === "closed"}
                            onClick={() => handleStatusChange(t._id, "closed")}
                          >
                            Closed
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-slate-500">
            <div>
              Page {data?.page || 1} of {data?.totalPages || 1} · {data?.totalRecords || 0} tickets
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!data || data.page <= 1}
                onClick={() => data && handlePageChange(data.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!data || data.page >= data.totalPages}
                onClick={() => data && handlePageChange(data.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
