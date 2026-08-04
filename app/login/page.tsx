"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, saveSession } from "@/lib/auth";
import { getApiErrorMessage } from "@/services/api";
import { login } from "@/services/launchops";

export default function LoginPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await login({
        tenantId: tenantId.trim(),
        email: email.trim(),
        password,
      });

      saveSession({
        token: response.data.accessToken,
        tenantId: response.data.tenantId,
        role: response.data.role,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fb] px-4 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white">
            LO
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              LaunchOps
            </p>
            <h1 className="text-2xl font-semibold text-slate-950">Sign in</h1>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Tenant ID</span>
            <input
              autoComplete="organization"
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              onChange={(event) => setTenantId(event.target.value)}
              required
              type="text"
              value={tenantId}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
              {error}
            </div>
          ) : null}

          <button
            className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
