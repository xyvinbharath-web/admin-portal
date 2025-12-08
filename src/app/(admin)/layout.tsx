"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuthGuard, useAuthActions } from "../../hooks/useAuth";
import { LayoutDashboard, Users, Ticket, Bell, Settings, CreditCard, CalendarRange, GraduationCap, HandCoins, Gift, ClipboardList, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/partners", label: "Partners", icon: Users },
  { href: "/admin/analytics/partners", label: "Analytics", icon: BarChart3 },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/events", label: "Events", icon: CalendarRange },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/rewards", label: "Rewards", icon: Gift },
  { href: "/admin/referrals", label: "Referrals", icon: HandCoins },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/support", label: "Support", icon: Ticket },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  useAuthGuard();
  const pathname = usePathname();
  const { logout } = useAuthActions();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-64 flex-col bg-slate-950 text-slate-100">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold">
            IC
          </div>
          <div>
            <div className="text-sm font-semibold">Impact Club</div>
            <div className="text-xs text-slate-400">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-xs text-slate-500">
              Welcome back! Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-500 md:block">
              Search...
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-slate-50 text-slate-600"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 text-xs font-semibold">
              AD
            </div>
          </div>
        </header>
        <main className="flex-1 bg-slate-100 p-6">{children}</main>
      </div>
    </div>
  );
}
