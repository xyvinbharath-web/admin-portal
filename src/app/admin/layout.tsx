"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthGuard, useAuthActions } from "../../hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Bell,
  Settings,
  CreditCard,
  CalendarRange,
  GraduationCap,
  HandCoins,
  Gift,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/partners", label: "Partners", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/events", label: "Events", icon: CalendarRange },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/posts", label: "Posts", icon: ClipboardList },
  { href: "/admin/rewards", label: "Rewards", icon: Gift },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col bg-slate-950 text-slate-100 md:flex">
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
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border bg-white p-1 text-slate-700 md:hidden"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div>
              <h1 className="text-sm font-semibold md:text-lg">Dashboard</h1>
              <p className="hidden text-xs text-slate-500 md:block">
                Welcome back! Here&apos;s what&apos;s happening with your business today.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/admin/notifications"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-slate-50 text-slate-600 md:h-9 md:w-9"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <Link href="/admin/settings">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-[10px] font-semibold md:h-9 md:w-9 md:text-xs">
                AD
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 bg-slate-100 p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="flex w-64 flex-col bg-slate-950 text-slate-100">
            <div className="flex h-16 items-center justify-between gap-3 border-b border-slate-800 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold">
                  IC
                </div>
                <div>
                  <div className="text-sm font-semibold">Impact Club</div>
                  <div className="text-xs text-slate-400">Admin Panel</div>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 p-1 text-slate-200"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-3 text-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                  >
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
                onClick={() => {
                  setMobileNavOpen(false);
                  logout();
                }}
              >
                Logout
              </Button>
            </div>
          </div>
          <button
            type="button"
            className="flex-1 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
