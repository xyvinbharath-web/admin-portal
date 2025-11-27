"use client";

import { useEffect, useState } from "react";
import { UserAdmin, RoleEnum, StatusEnum } from "@/types/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateRoleSchema, updateStatusSchema } from "@/validators/adminUserClientSchemas";
import { toastError, toastSuccess } from "@/lib/toast";

interface UserDetailCardProps {
  user: UserAdmin;
  onUpdateRole: (role: RoleEnum) => Promise<unknown>;
  onUpdateStatus: (status: StatusEnum) => Promise<unknown>;
  onUpdateMembership?: (tier: string) => Promise<unknown>;
  rolePending?: boolean;
  statusPending?: boolean;
  membershipPending?: boolean;
}

export function UserDetailCard({ user, onUpdateRole, onUpdateStatus, onUpdateMembership, rolePending, statusPending, membershipPending }: UserDetailCardProps) {
  const [role, setRole] = useState<RoleEnum>(user.role);
  const [status, setStatus] = useState<StatusEnum>(user.status);
  const [membershipTier, setMembershipTier] = useState<string>(user.membershipTier ?? "free");

  // Keep local state in sync with latest user data (after mutations/refetches)
  useEffect(() => {
    setRole(user.role);
  }, [user.role]);

  useEffect(() => {
    setStatus(user.status);
  }, [user.status]);

  useEffect(() => {
    setMembershipTier(user.membershipTier ?? "free");
  }, [user.membershipTier]);

  const initials = user.name?.[0]?.toUpperCase() ?? "U";

  async function handleSaveRole() {
    const parsed = updateRoleSchema.safeParse({ role });
    if (!parsed.success) {
      toastError("Please select a valid role");
      return;
    }
    await onUpdateRole(parsed.data.role);
    toastSuccess("Role updated");
  }

  async function handleSaveStatus() {
    const parsed = updateStatusSchema.safeParse({ status });
    if (!parsed.success) {
      toastError("Please select a valid status");
      return;
    }
    await onUpdateStatus(parsed.data.status);
    toastSuccess("Status updated");
  }

  async function handleSaveMembership() {
    if (!onUpdateMembership) return;
    if (!membershipTier) {
      toastError("Please select a membership tier");
      return;
    }
    await onUpdateMembership(membershipTier);
    toastSuccess("Membership updated");
  }

  return (
    <Card className="rounded-2xl border bg-white">
      <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
        <div className="flex items-center gap-4 md:w-1/3">
          <Avatar className="h-16 w-16">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="text-lg font-semibold text-slate-900">{user.name}</div>
            <div className="text-sm text-slate-600">{user.email}</div>
            {user.phone && <div className="text-xs text-slate-500">{user.phone}</div>}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
              <Badge variant={user.status === "suspended" ? "destructive" : "outline"} className="capitalize">
                {user.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-4 text-sm md:grid-cols-2">
          {user.role === "user" && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500">Membership</div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">Tier</div>
                    <select
                      className="mt-1 h-9 w-full rounded-md border bg-white px-2 text-sm"
                      value={membershipTier}
                      onChange={(e) => setMembershipTier(e.target.value)}
                    >
                      <option value="free">Free</option>
                      <option value="gold">Gold</option>
                    </select>
                  </div>
                  {onUpdateMembership && (
                    <Button size="sm" onClick={handleSaveMembership} disabled={membershipPending}>
                      {membershipPending ? "Saving..." : "Save"}
                    </Button>
                  )}
                </div>
                <div className="mt-2 text-xs text-slate-500">Rewards balance: {user.rewards ?? 0}</div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">Account</div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Joined</div>
              <div className="text-sm font-medium text-slate-800">
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
              </div>
              {user.updatedAt && (
                <div className="mt-1 text-xs text-slate-500">
                  Last updated: {new Date(user.updatedAt).toLocaleString()}
                </div>
              )}
              {user.role === "user" && user.subscription && (
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold">Plan:</span> {user.subscription.plan ?? "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Subscription status:</span> {user.subscription.status ?? "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Expires:</span>{" "}
                    {user.subscription.expiresAt
                      ? new Date(user.subscription.expiresAt).toLocaleString()
                      : "-"}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">Analytics</div>
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold">Courses created:</span> {user.coursesCreatedCount ?? 0}
              </div>
              <div className="mt-1">
                <span className="font-semibold">Event bookings:</span> {user.eventBookingsCount ?? 0}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">Role</div>
            <div className="flex items-center gap-2">
              <select
                className="h-9 flex-1 rounded-md border bg-white px-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as RoleEnum)}
              >
                <option value="user">User</option>
                <option value="partner_request">Partner request</option>
                <option value="partner">Partner</option>
                <option value="admin">Admin</option>
              </select>
              <Button size="sm" onClick={handleSaveRole} disabled={rolePending}>
                {rolePending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">Status</div>
            <div className="flex items-center gap-2">
              <select
                className="h-9 flex-1 rounded-md border bg-white px-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusEnum)}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <Button size="sm" onClick={handleSaveStatus} disabled={statusPending}>
                {statusPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
