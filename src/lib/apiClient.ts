import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("admin_token");
    if (token) {
      // Cast to any to avoid strict Axios v1 header typings blocking header mutation
      const cfg: any = config;
      if (!cfg.headers) {
        cfg.headers = {};
      }

      if (typeof cfg.headers.set === "function") {
        cfg.headers.set("Authorization", `Bearer ${token}`);
      } else {
        cfg.headers["Authorization"] = `Bearer ${token}`;
      }

      return cfg;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
