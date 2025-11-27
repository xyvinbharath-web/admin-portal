"use client";

import { useState } from "react";
import { useAuthActions, useAuthGuard } from "../../../hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function LoginPage() {
  useAuthGuard();
  const { login } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login({ email, password });
      if (!res.success) {
        setError(res.message || "Login failed");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-semibold text-white">Admin Login</h1>
        <p className="mb-6 text-sm text-slate-400">
          Sign in with your admin credentials to access the dashboard.
        </p>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <span className="text-sm">{error}</span>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-900/60 text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-900/60 text-slate-100"
            />
          </div>
          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
