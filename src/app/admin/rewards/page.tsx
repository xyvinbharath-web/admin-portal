"use client";

import { useAdminRedemptions } from "@/hooks/useAdminRewards";
import type { RedemptionStatus, RewardRedemptionRow } from "@/services/admin/rewards";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS: { value: RedemptionStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "paid", label: "Paid" },
];

export default function RewardsPage() {
  const {
    data,
    isLoading,
    query,
    setPage,
    setLimit,
    setStatusFilter,
    updateStatus,
    updateStatusState,
  } = useAdminRedemptions({ page: 1, limit: 20 });

  const pagination = data
    ? {
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        totalRecords: data.totalRecords,
      }
    : undefined;

  function handleStatusChangeFilter(value: string) {
    setStatusFilter((value || "") as RedemptionStatus | "");
  }

  async function handleRowStatusChange(row: RewardRedemptionRow, status: RedemptionStatus) {
    await updateStatus({ id: row._id, status });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Rewards</h2>
        <p className="text-sm text-slate-500">
          View and manage user reward redemptions.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 text-xs md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Filters
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Status</span>
              <select
                className="h-8 rounded-md border bg-white px-2 text-xs"
                value={query.status || ""}
                onChange={(e) => handleStatusChangeFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {pagination && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={pagination.page === 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
              >
                Next
              </Button>
              <select
                className="h-7 rounded-md border bg-white px-2"
                value={pagination.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white">
        {/* Mobile: cards */}
        <div className="space-y-2 p-3 text-xs md:hidden">
          {isLoading ? (
            <div className="rounded-lg border bg-white p-3 text-slate-500">
              Loading redemptions...
            </div>
          ) : !data || data.records.length === 0 ? (
            <div className="rounded-lg border bg-white p-3 text-slate-500">
              No redemptions found.
            </div>
          ) : (
            data.records.map((row) => (
              <div
                key={row._id}
                className="rounded-xl border bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      User
                    </div>
                    <div className="text-xs font-medium text-slate-900">
                      {row.user?.name || row.user?.email || row.user?._id || "Unknown"}
                    </div>
                    {row.user?.email && (
                      <div className="text-[11px] text-slate-500">{row.user.email}</div>
                    )}
                  </div>
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700">
                    {row.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Points
                    </div>
                    <div>{row.points}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Amount
                    </div>
                    <div>{row.amount}</div>
                  </div>
                </div>
                {row.createdAt && (
                  <div className="mt-2 text-[11px] text-slate-500">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Requested at
                    </div>
                    <div>{new Date(row.createdAt).toLocaleString()}</div>
                  </div>
                )}
                <div className="mt-2 text-[11px] text-slate-700">
                  {row.payoutMethod && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">
                        Payout method
                      </span>
                      <div>{row.payoutMethod}</div>
                    </div>
                  )}
                  {row.note && (
                    <div className="mt-1">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">
                        Note
                      </span>
                      <div className="line-clamp-3">{row.note}</div>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <select
                    className="h-8 w-full rounded-md border bg-white px-2 text-[11px]"
                    value={row.status}
                    disabled={updateStatusState.isPending}
                    onChange={async (e) =>
                      handleRowStatusChange(row, e.target.value as RedemptionStatus)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </select>
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
                  onClick={() => setPage(pagination.page - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPage(pagination.page + 1)}
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
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Points</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Payout method</th>
                  <th className="px-3 py-2">Requested at</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-xs text-slate-500"
                      colSpan={6}
                    >
                      Loading redemptions...
                    </td>
                  </tr>
                )}

                {!isLoading && (!data || data.records.length === 0) && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-xs text-slate-500"
                      colSpan={6}
                    >
                      No redemptions found.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  data &&
                  data.records.map((row) => (
                    <tr key={row._id} className="text-[13px] text-slate-700">
                      <td className="px-3 py-2 align-top text-xs">
                        <div className="font-medium">
                          {row.user?.name || row.user?.email || row.user?._id || "Unknown"}
                        </div>
                        {row.user?.email && (
                          <div className="text-[11px] text-slate-500">{row.user.email}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-xs">{row.points}</td>
                      <td className="px-3 py-2 align-top text-xs">{row.amount}</td>
                      <td className="px-3 py-2 align-top text-xs">{row.payoutMethod || "-"}</td>
                      <td className="px-3 py-2 align-top text-xs text-slate-500">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        <select
                          className="h-7 rounded-md border bg-white px-2 text-[11px] capitalize"
                          value={row.status}
                          disabled={updateStatusState.isPending}
                          onChange={async (e) =>
                            handleRowStatusChange(row, e.target.value as RedemptionStatus)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-slate-500">
              <div>
                Page {pagination.page} of {pagination.totalPages} • {pagination.totalRecords} redemptions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={pagination.page === 1}
                  onClick={() => setPage(pagination.page - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPage(pagination.page + 1)}
                >
                  Next
                </Button>
                <select
                  className="h-7 rounded-md border bg-white px-2"
                  value={pagination.limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
