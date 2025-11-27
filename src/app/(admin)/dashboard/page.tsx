"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, CalendarRange, CreditCard } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatsResponse {
  success: boolean;
  data?: {
    totalUsers: number;
    totalPartners: number;
    totalBookings: number;
    totalRevenue: number;
    monthly: { month: string; users: number; revenue: number }[];
  };
}

async function fetchDashboardStats() {
  // For now, use existing endpoints; if a dedicated stats endpoint exists we can switch.
  const res = await apiClient.get<StatsResponse>("/api/v1/admin/stats");
  return res.data.data ?? {
    totalUsers: 0,
    totalPartners: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthly: [],
  };
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  const monthlyData = data?.monthly?.length
    ? data.monthly
    : [
        { month: "Jan", users: 0, revenue: 0 },
        { month: "Feb", users: 0, revenue: 0 },
        { month: "Mar", users: 0, revenue: 0 },
      ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${data?.totalRevenue ?? 0}`}
        />
        <StatCard
          icon={CalendarRange}
          label="Total Bookings"
          value={data?.totalBookings ?? 0}
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={data?.totalUsers ?? 0}
        />
        <StatCard
          icon={CreditCard}
          label="Total Partners"
          value={data?.totalPartners ?? 0}
        />
      </div>

      <Card className="rounded-2xl border bg-white">
        <CardContent className="p-4">
          <h2 className="mb-2 text-sm font-medium text-slate-700">
            Monthly Users & Revenue
          </h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ left: -20, right: 10 }}>
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card className="rounded-2xl border bg-white">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">
            {value}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
