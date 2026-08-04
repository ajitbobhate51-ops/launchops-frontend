"use client";

import axios, { AxiosError } from "axios";
import { clearSession, getSession } from "@/lib/auth";

export type ApiErrorBody = {
  code?: string;
  message?: string;
  timestamp?: string;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const session = getSession();
  const isLoginRequest = config.url === "/api/auth/login";

  if (session && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${session.token}`;
    config.headers["X-Tenant-ID"] = session.tenantId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      clearSession();

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "Unable to reach the LaunchOps API."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
