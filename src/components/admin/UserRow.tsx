"use client";

import { useRouter } from "next/navigation";
import { UserAdmin } from "@/types/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface UserRowProps {
  user: UserAdmin;
  onView?: (user: UserAdmin) => void;
  onToggleStatus?: (user: UserAdmin) => Promise<void> | void;
  basePath?: string;
}

export function UserRow({ user, onView, onToggleStatus, basePath = "/admin/users" }: UserRowProps) {
  const router = useRouter();
  const initials = user.name?.[0]?.toUpperCase() ?? "U";

  const handleView = () => {
    if (onView) onView(user);
    router.push(`${basePath}/${user._id}`);
  };

  const isSuspended = user.status === "suspended";

  return (
    <tr
      className="cursor-pointer border-b last:border-b-0 hover:bg-slate-50/80"
      onClick={handleView}
      tabIndex={0}
      aria-label={`View user ${user.name}`}
    >
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="text-sm font-medium text-slate-900">{user.name}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{user.phone ?? "-"}</td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="text-[11px] capitalize">
          {user.role}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={isSuspended ? "destructive" : "outline"}
          className="text-[11px] capitalize"
        >
          {user.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-xs text-slate-600">{user.rewards ?? 0}</td>
      <td className="px-4 py-3 text-xs text-slate-600">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
      </td>
      <td
        className="px-4 py-3"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <ConfirmDialog
          title={isSuspended ? "Activate user" : "Suspend user"}
          description={
            isSuspended
              ? "This will mark the user as active again."
              : "This will suspend the user and prevent access to the platform."
          }
          destructive={!isSuspended}
          confirmLabel={isSuspended ? "Activate" : "Suspend"}
          onConfirm={async () => {
            if (onToggleStatus) await onToggleStatus(user);
          }}
          trigger={
            <Button variant="ghost" size="icon" aria-label="User actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
      </td>
    </tr>
  );
}
