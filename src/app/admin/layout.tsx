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
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-[#f8f5f3]/90 backdrop-blur md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
            IC
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Impact Club</div>
            <div className="text-xs text-slate-400">Admin panel</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? "bg-[#ff4f5e] text-white shadow-[0_10px_30px_rgba(255,79,94,0.35)]"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center rounded-full border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1 text-slate-700 md:hidden"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 md:text-lg">Dashboard</h1>
              <p className="hidden text-xs text-slate-500 md:block">
                Welcome back! Here&apos;s what&apos;s happening with your business today.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/admin/notifications"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs md:h-9 md:w-9"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <Link href="/admin/settings">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white md:h-9 md:w-9 md:text-xs shadow-sm">
                AD
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 bg-slate-50 p-4 md:px-8 md:py-6">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="flex w-64 flex-col border-r border-slate-200 bg-white/95 text-slate-900">
            <div className="flex h-16 items-center justify-between gap-3 border-b border-slate-100 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                  IC
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Impact Club</div>
                  <div className="text-xs text-slate-400">Admin Panel</div>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1 text-slate-700"
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
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-100 p-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center rounded-full border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
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
