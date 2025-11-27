"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { clearToken, getToken, setToken } from "../lib/auth";
import apiClient from "../lib/apiClient";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken?: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();
    const isAuthRoute = pathname?.startsWith("/login");

    if (!token && !isAuthRoute) {
      router.replace("/login");
    }
    if (token && isAuthRoute) {
      router.replace("/admin/dashboard");
    }
  }, [pathname, router]);
}

export function useAuthActions() {
  const router = useRouter();

  async function login(payload: LoginPayload) {
    const res = await apiClient.post<LoginResponse>("/api/v1/admin/login", payload);
    if (res.data.success && res.data.data?.accessToken) {
      setToken(res.data.data.accessToken);
      router.push("/admin/dashboard");
    }
    return res.data;
  }

  function logout() {
    clearToken();
    router.push("/login");
  }

  return { login, logout };
}
