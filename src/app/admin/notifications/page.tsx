"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAdminSendNotification } from "@/hooks/useAdminNotifications";

export default function NotificationsPage() {
  const [audience, setAudience] = useState<"single" | "all-users" | "all-partners">("single");
  const [template, setTemplate] = useState("custom");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("info");
  const [dataJson, setDataJson] = useState("{}");

  const mutation = useAdminSendNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedData: Record<string, any> | undefined;
    if (dataJson.trim()) {
      try {
        parsedData = JSON.parse(dataJson);
      } catch {
        // eslint-disable-next-line no-alert
        alert("Invalid JSON in metadata");
        return;
      }
    }

    await mutation.mutateAsync({
      audience,
      userId,
      title,
      body: body || undefined,
      type: type as any,
      data: parsedData,
    } as any);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <p className="text-sm text-slate-500">
          Send in-app notifications to specific users for testing.
        </p>
      </div>

      <Card className="rounded-2xl border bg-white">
        <CardContent className="space-y-4 p-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Audience</label>
                <select
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as any)}
                >
                  <option value="single">Single user (by ID)</option>
                  <option value="all-users">All users</option>
                  <option value="all-partners">All partners</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Template</label>
                <select
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
                  value={template}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTemplate(value);
                    if (value === "welcome") {
                      setTitle("Welcome to Impact Club");
                      setBody("Thanks for joining! Explore courses and events tailored for you.");
                    } else if (value === "new-course") {
                      setTitle("New course available");
                      setBody("A new course has just been published. Check it out in the Courses section.");
                    } else if (value === "subscription") {
                      setTitle("Your subscription status");
                      setBody("Your subscription has been updated. Visit Subscriptions to see the details.");
                    }
                  }}
                >
                  <option value="custom">Custom message</option>
                  <option value="welcome">Welcome message</option>
                  <option value="new-course">New course announcement</option>
                  <option value="subscription">Subscription update</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Type</label>
                <select
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>

            {audience === "single" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">User ID</label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Target user MongoDB _id"
                  required={audience === "single"}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Body</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Optional message body"
                rows={3}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Metadata (JSON)</label>
              <Textarea
                value={dataJson}
                onChange={(e) => setDataJson(e.target.value)}
                rows={3}
              />
              <p className="text-[11px] text-slate-500">
                Optional additional data payload, e.g. {"{"}"screen":"course","courseId":"..."{"}"}.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={mutation.status === "pending"}
                className="px-4 py-2 text-xs"
              >
                {mutation.status === "pending" ? "Sending..." : "Send test notification"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
