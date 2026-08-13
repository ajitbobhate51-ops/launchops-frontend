"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LaunchOpsShell } from "@/components/LaunchOpsShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/PageState";
import { StatusPill } from "@/components/ResourcePage";
import { getApiErrorMessage } from "@/services/api";
import {
  TenantUser,
  createTenantUser,
  listTenantUsers,
  updateTenantUserEnabled,
} from "@/services/launchops";

type UserFormState = {
  email: string;
  password: string;
  role: "TENANT_ADMIN" | "TENANT_USER";
};

const initialFormState: UserFormState = {
  email: "",
  password: "",
  role: "TENANT_USER",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function UsersPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [form, setForm] = useState<UserFormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listTenantUsers();
      setUsers(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = form.email.trim();
    if (!email) {
      setError("Email is required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createTenantUser({ email, password: form.password, role: form.role });
      setForm(initialFormState);
      await loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(user: TenantUser) {
    setUpdatingId(user.id);
    setError("");

    try {
      await updateTenantUserEnabled(user.id, !user.enabled);
      await loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <LaunchOpsShell>
      <section className="grid gap-6 py-8 lg:grid-cols-[24rem_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Create User</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add tenant users with an admin or user role.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                autoComplete="email"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                type="email"
                value={form.email}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                autoComplete="new-password"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                disabled={saving}
                minLength={8}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                type="password"
                value={form.password}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Role</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as UserFormState["role"],
                  }))
                }
                value={form.role}
              >
                <option value="TENANT_USER">Tenant User</option>
                <option value="TENANT_ADMIN">Tenant Admin</option>
              </select>
            </label>

            <button
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={saving}
              type="submit"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </form>
        </aside>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Tenant Users</h2>
              <p className="mt-1 text-sm text-slate-500">
                Users returned by /api/tenant/users.
              </p>
            </div>
            <button
              className="w-fit rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={loading || saving || updatingId !== null}
              onClick={loadUsers}
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="p-5">
            {loading ? <LoadingState label="Loading users..." /> : null}
            {error ? <ErrorState message={error} /> : null}
            {!loading && !error && users.length === 0 ? (
              <EmptyState message="No tenant users were returned." />
            ) : null}
          </div>

          {!loading && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        #{user.id}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{user.email}</td>
                      <td className="px-5 py-4">
                        <StatusPill>{user.role}</StatusPill>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill tone={user.enabled ? "emerald" : "rose"}>
                          {user.enabled ? "Enabled" : "Disabled"}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                          disabled={saving || updatingId !== null}
                          onClick={() => handleToggle(user)}
                          type="button"
                        >
                          {updatingId === user.id
                            ? "Updating..."
                            : user.enabled
                              ? "Disable"
                              : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>
    </LaunchOpsShell>
  );
}
