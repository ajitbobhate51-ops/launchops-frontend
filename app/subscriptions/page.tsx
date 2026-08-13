"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { LaunchOpsShell } from "@/components/LaunchOpsShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/PageState";
import { StatusPill } from "@/components/ResourcePage";
import { getApiErrorMessage } from "@/services/api";
import {
  BillingPlan,
  Customer,
  Subscription,
  cancelSubscription,
  createSubscription,
  listCustomers,
  listPlans,
  listSubscriptions,
} from "@/services/launchops";

type SubscriptionFormState = {
  customerId: string;
  planId: string;
};

const initialFormState: SubscriptionFormState = {
  customerId: "",
  planId: "",
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not cancelled";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [form, setForm] = useState<SubscriptionFormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const activePlans = useMemo(() => plans.filter((plan) => plan.active), [plans]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [subscriptionResponse, customerResponse, planResponse] =
        await Promise.all([listSubscriptions(), listCustomers(), listPlans()]);
      setSubscriptions(subscriptionResponse.data);
      setCustomers(customerResponse.data);
      setPlans(planResponse.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const customerId = Number(form.customerId);
    const planId = Number(form.planId);

    if (!Number.isInteger(customerId) || !Number.isInteger(planId)) {
      setError("Choose a customer and an active plan.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createSubscription({ customerId, planId });
      setForm(initialFormState);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(subscription: Subscription) {
    const confirmed = window.confirm(`Cancel subscription #${subscription.id}?`);
    if (!confirmed) {
      return;
    }

    setCancellingId(subscription.id);
    setError("");

    try {
      await cancelSubscription(subscription.id);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <LaunchOpsShell>
      <section className="grid gap-6 py-8 lg:grid-cols-[24rem_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Create Subscription</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pair an existing customer with an active billing plan.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Customer</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                disabled={saving || loading}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customerId: event.target.value,
                  }))
                }
                value={form.customerId}
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Plan</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                disabled={saving || loading}
                onChange={(event) =>
                  setForm((current) => ({ ...current, planId: event.target.value }))
                }
                value={form.planId}
              >
                <option value="">Select active plan</option>
                {activePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {formatMoney(plan.amount, plan.currency)}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={saving || loading || customers.length === 0 || activePlans.length === 0}
              type="submit"
            >
              {saving ? "Creating..." : "Create Subscription"}
            </button>
          </form>
        </aside>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Subscriptions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Subscriptions returned by /api/subscriptions.
              </p>
            </div>
            <button
              className="w-fit rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={loading || saving || cancellingId !== null}
              onClick={loadData}
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="p-5">
            {loading ? <LoadingState label="Loading subscriptions..." /> : null}
            {error ? <ErrorState message={error} /> : null}
            {!loading && !error && subscriptions.length === 0 ? (
              <EmptyState message="No subscriptions were returned." />
            ) : null}
          </div>

          {!loading && subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Cancelled</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        #{subscription.id}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        #{subscription.customerId}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {subscription.planName}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatMoney(subscription.planAmount, subscription.currency)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill
                          tone={
                            subscription.status === "ACTIVE" ? "emerald" : "rose"
                          }
                        >
                          {subscription.status}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(subscription.cancelledAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
                          disabled={
                            saving ||
                            cancellingId !== null ||
                            subscription.status === "CANCELLED"
                          }
                          onClick={() => handleCancel(subscription)}
                          type="button"
                        >
                          {cancellingId === subscription.id ? "Cancelling..." : "Cancel"}
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
