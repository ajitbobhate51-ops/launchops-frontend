"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LaunchOpsShell } from "@/components/LaunchOpsShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/PageState";
import { StatusPill } from "@/components/ResourcePage";
import { getApiErrorMessage } from "@/services/api";
import {
  BillingInterval,
  BillingPlan,
  createPlan,
  listPlans,
  updatePlanEnabled,
} from "@/services/launchops";

type PlanFormState = {
  code: string;
  name: string;
  description: string;
  amount: string;
  currency: string;
  billingInterval: BillingInterval;
};

const initialFormState: PlanFormState = {
  code: "",
  name: "",
  description: "",
  amount: "",
  currency: "USD",
  billingInterval: "MONTHLY",
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export default function PlansPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [form, setForm] = useState<PlanFormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listPlans();
      setPlans(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = form.code.trim().toUpperCase();
    const name = form.name.trim();
    const amount = Number(form.amount);
    const currency = form.currency.trim().toUpperCase();

    if (!code || !name) {
      setError("Code and name are required.");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      setError("Amount must be a valid non-negative number.");
      return;
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      setError("Currency must be a 3-letter code.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createPlan({
        code,
        name,
        description: form.description.trim() || undefined,
        amount,
        currency,
        billingInterval: form.billingInterval,
      });
      setForm(initialFormState);
      await loadPlans();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(plan: BillingPlan) {
    setUpdatingId(plan.id);
    setError("");

    try {
      await updatePlanEnabled(plan.id, !plan.active);
      await loadPlans();
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
          <h2 className="text-lg font-semibold">Create Plan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Define tenant billing plans for subscriptions.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Code</span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  disabled={saving}
                  maxLength={64}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, code: event.target.value }))
                  }
                  placeholder="BASIC"
                  value={form.code}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Name</span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  disabled={saving}
                  maxLength={255}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  value={form.name}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Description
              </span>
              <textarea
                className="mt-2 min-h-20 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                disabled={saving}
                maxLength={1000}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                value={form.description}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Amount</span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  disabled={saving}
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  step="0.01"
                  type="number"
                  value={form.amount}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Currency</span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  disabled={saving}
                  maxLength={3}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      currency: event.target.value,
                    }))
                  }
                  value={form.currency}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Interval</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    billingInterval: event.target.value as BillingInterval,
                  }))
                }
                value={form.billingInterval}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>

            <button
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={saving}
              type="submit"
            >
              {saving ? "Creating..." : "Create Plan"}
            </button>
          </form>
        </aside>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Billing Plans</h2>
              <p className="mt-1 text-sm text-slate-500">
                Plans returned by /api/plans.
              </p>
            </div>
            <button
              className="w-fit rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={loading || saving || updatingId !== null}
              onClick={loadPlans}
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="p-5">
            {loading ? <LoadingState label="Loading plans..." /> : null}
            {error ? <ErrorState message={error} /> : null}
            {!loading && !error && plans.length === 0 ? (
              <EmptyState message="No billing plans were returned." />
            ) : null}
          </div>

          {!loading && plans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Code</th>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Interval</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        {plan.code}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{plan.name}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatMoney(plan.amount, plan.currency)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill>{plan.billingInterval}</StatusPill>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill tone={plan.active ? "emerald" : "rose"}>
                          {plan.active ? "Active" : "Disabled"}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                          disabled={saving || updatingId !== null}
                          onClick={() => handleToggle(plan)}
                          type="button"
                        >
                          {updatingId === plan.id
                            ? "Updating..."
                            : plan.active
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
