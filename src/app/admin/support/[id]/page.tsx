"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminSupportTicket } from "@/hooks/useAdminSupport";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";
  const { data, isLoading, isError, addReply, addReplyState } =
    useAdminSupportTicket(id);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!message.trim() || !id) return;
    await addReply(message.trim());
    setMessage("");
  };

  const renderStatusBadge = (status?: string) => {
    if (!status) return null;

    let color = "bg-slate-100 text-slate-700";
    if (status === "open") color = "bg-emerald-100 text-emerald-700";
    if (status === "in_progress") color = "bg-amber-100 text-amber-700";
    if (status === "closed") color = "bg-slate-200 text-slate-700";

    const label = status.replace("_", " ");

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Support ticket</h2>
          <p className="text-sm text-slate-500">
            View conversation and reply to the user.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/support")}
        >
          Back to list
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white p-4 text-sm text-slate-500">
          Loading ticket...
        </div>
      ) : isError || !data ? (
        <div className="rounded-lg border bg-white p-4 text-sm text-red-500">
          Failed to load ticket.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ticket header */}
          <div className="rounded-lg border bg-white p-4 text-sm">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Ticket
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Subject</div>
                <div className="text-sm font-medium">{data.subject}</div>
              </div>
              <div className="mt-1">{renderStatusBadge(data.status)}</div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-xs text-slate-500">From</div>
              <div className="text-sm">
                {data.user?.name || "Unknown"}
                {data.user?.email && (
                  <span className="text-xs text-slate-500">
                    {" "}
                    - {data.user.email}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-xs text-slate-500">Message</div>
              <div className="whitespace-pre-wrap text-sm text-slate-700">
                {data.message}
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="rounded-lg border bg-white p-4 text-sm">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Conversation
            </div>
            <div className="space-y-3">
              {/* Original message as first item */}
              <div className="rounded border border-slate-100 bg-slate-50 p-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{data.user?.name || "User"}</span>
                  {data.createdAt && (
                    <span>{new Date(data.createdAt).toLocaleString()}</span>
                  )}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {data.message}
                </div>
              </div>

              {/* Replies */}
              {data.replies && data.replies.length > 0 && (
                <div className="space-y-2">
                  {data.replies.map((r) => (
                    <div
                      key={r._id}
                      className="rounded border border-slate-100 bg-white p-2"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{r.user?.name || "Reply"}</span>
                        {r.createdAt && (
                          <span>{new Date(r.createdAt).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                        {r.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reply form */}
          <div className="space-y-3 rounded-lg border bg-white p-4 text-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Add reply
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply to the user..."
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={addReplyState.isPending || !message.trim()}
              >
                {addReplyState.isPending ? "Sending..." : "Send reply"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}