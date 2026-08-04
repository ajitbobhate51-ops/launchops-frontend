"use client";

export type UserRole = "TENANT_ADMIN" | "TENANT_USER";

export type AuthSession = {
  token: string;
  tenantId: string;
  role: UserRole;
};

const TOKEN_KEY = "launchops.token";
const TENANT_ID_KEY = "launchops.tenantId";
const ROLE_KEY = "launchops.role";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const token = window.localStorage.getItem(TOKEN_KEY);
  const tenantId = window.localStorage.getItem(TENANT_ID_KEY);
  const role = window.localStorage.getItem(ROLE_KEY) as UserRole | null;

  if (!token || !tenantId || !role) {
    return null;
  }

  return { token, tenantId, role };
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(TENANT_ID_KEY, session.tenantId);
  window.localStorage.setItem(ROLE_KEY, session.role);
}

export function clearSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(TENANT_ID_KEY);
  window.localStorage.removeItem(ROLE_KEY);
}

export function logout() {
  clearSession();

  if (isBrowser()) {
    window.location.assign("/login");
  }
}
