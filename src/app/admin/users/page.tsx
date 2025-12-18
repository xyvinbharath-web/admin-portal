"use client";

import { useState } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs";
import type { AuditLogRow } from "@/services/admin/auditLogs";

function formatDate(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatMeta(meta: any) {
  if (!meta || typeof meta !== "object") return "-";
  try {
    return JSON.stringify(meta, null, 2);
  } catch {
    return String(meta);
  }
}

export default function AdminAuditLogsPage() {
  const { data, isLoading, setQuery } = useAdminAuditLogs({
    page: 1,
    limit: 20,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pagination = data
    ? {
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        totalRecords: data.totalRecords,
      }
    : undefined;

  function handlePageChange(page: number) {
    setQuery((prev) => ({ ...prev, page }));
  }

  function handleLimitChange(limit: number) {
    setQuery((prev) => ({ ...prev, page: 1, limit }));
  }

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Audit logs</h1>
            <p className="text-xs text-slate-500">
              See everything admins have been doing in the system.
            </p>
          </div>
        </div>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">When</th>
                      <th className="px-3 py-2">Actor</th>
                      <th className="px-3 py-2">User / Entity</th>
                      <th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2">IP</th>
                      <th className="px-3 py-2">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {isLoading && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-6 text-center text-xs text-slate-500"
                        >
                          Loading audit logs...
                        </td>
                      </tr>
                    )}

                    {!isLoading &&
                      (!data || data.records.length === 0) && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-3 py-6 text-center text-xs text-slate-500"
                          >
                            No audit entries yet.
                          </td>
                        </tr>
                      )}

                    {!isLoading &&
                      data &&
                      data.records.map((row: AuditLogRow) => {
                        const isExpanded = expandedId === row._id;
                        const hasMeta =
                          row.meta && Object.keys(row.meta).length > 0;

                        return (
                          <tr
                            key={row._id}
                            className="align-top text-[13px] text-slate-700"
                          >
                            <td className="px-3 py-2 text-xs text-slate-500">
                              {formatDate(row.createdAt)}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              <div className="font-mono text-[11px] text-slate-700">
                                {row.actorId || "-"}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs">
                              <div className="font-mono text-[11px] text-slate-700">
                                {row.userId || "-"}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs">
                              <div className="font-mono text-[11px] text-sky-800">
                                {row.action}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-500">
                              {row.ip || "-"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {hasMeta ? (
                                <div className="space-y-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-[11px]"
                                    onClick={() =>
                                      setExpandedId(
                                        isExpanded ? null : row._id,
                                      )
                                    }
                                  >
                                    {isExpanded ? "Hide details" : "View JSON"}
                                  </Button>
                                  {isExpanded && (
                                    <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-slate-50 p-2 text-[11px] leading-snug text-slate-800">
                                      {formatMeta(row.meta)}
                                    </pre>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-slate-500">
                  <div>
                    Page {pagination.page} of {pagination.totalPages} •{" "}
                    {pagination.totalRecords} entries
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
                      onChange={(e) =>
                        handleLimitChange(Number(e.target.value))
                      }
                    >
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile list */}
            <div className="space-y-2 p-3 text-xs md:hidden">
              {isLoading && (
                <div className="rounded-lg border bg-white p-3 text-slate-500">
                  Loading audit logs...
                </div>
              )}
              {!isLoading &&
                data &&
                data.records.map((row) => (
                  <div
                    key={row._id}
                    className="rounded-xl border bg-white p-3 shadow-sm"
                  >
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      {formatDate(row.createdAt)}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-sky-800">
                      {row.action}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">
                      <span className="font-semibold">Actor:</span>{" "}
                      <span className="font-mono">{row.actorId || "-"}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold">User:</span>{" "}
                      <span className="font-mono">{row.userId || "-"}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold">IP:</span>{" "}
                      {row.ip || "-"}
                    </div>
                    {row.meta && (
                      <details className="mt-1 text-[11px]">
                        <summary className="cursor-pointer text-sky-700">
                          Meta
                        </summary>
                        <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-slate-50 p-2 text-[11px] leading-snug text-slate-800">
                          {formatMeta(row.meta)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToastProvider>
  );
}