"use client";

import { useEffect, useMemo, useState } from "react";
import { LaunchOpsShell } from "@/components/LaunchOpsShell";
import { ErrorState, LoadingState } from "@/components/PageState";
import { getApiErrorMessage } from "@/services/api";
import {
  BillingPlan,
  Customer,
  Subscription,
  TenantUser,
  listCustomers,
  listPlans,
  listSubscriptions,
  listTenantUsers,
} from "@/services/launchops";

type DashboardData = {
  customers: Customer[];
  users: TenantUser[];
  plans: BillingPlan[];
  subscriptions: Subscription[];
};

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "sky" | "amber" | "rose";
}) {
  const toneClasses = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
          Live
        </span>
      </div>
      <p className="mt-5 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const [customers, users, plans, subscriptions] = await Promise.all([
          listCustomers(),
          listTenantUsers(),
          listPlans(),
          listSubscriptions(),
        ]);

        if (mounted) {
          setData({
            customers: customers.data,
            users: users.data,
            plans: plans.data,
            subscriptions: subscriptions.data,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(getApiErrorMessage(err));
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    if (!data) {
      return null;
    }

    const activeSubscriptions = data.subscriptions.filter(
      (subscription) => subscription.status === "ACTIVE",
    );
    const inactivePlans = data.plans.filter((plan) => !plan.active);
    const activeRevenue = activeSubscriptions.reduce(
      (total, subscription) => total + Number(subscription.planAmount),
      0,
    );
    const currency = activeSubscriptions[0]?.currency ?? data.plans[0]?.currency ?? "USD";

    return {
      activeSubscriptions,
      inactivePlans,
      activeRevenue,
      currency,
      latestSubscriptions: data.subscriptions.slice(0, 5),
      enabledUsers: data.users.filter((user) => user.enabled).length,
    };
  }, [data]);

  return (
    <LaunchOpsShell>
      <section className="grid gap-6 py-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Tenant operations
              </p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                Billing, users, and subscriptions from your LaunchOps API.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Monitor customer coverage, plan availability, active subscriptions, and calculated pricing in one workspace.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-300">Revenue snapshot</p>
                <p className="text-sm font-semibold text-emerald-300">
                  {summary ? formatMoney(summary.activeRevenue, summary.currency) : "..."}
                </p>
              </div>
              <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-white/10">
                <div
                  className="bg-emerald-500"
                  style={{
                    width: summary
                      ? `${Math.max(8, Math.min(100, summary.activeSubscriptions.length * 20))}%`
                      : "33%",
                  }}
                />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-400">Customers</p>
                  <p className="mt-1 text-lg font-semibold">{data?.customers.length ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Users</p>
                  <p className="mt-1 text-lg font-semibold">{data?.users.length ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Plans</p>
                  <p className="mt-1 text-lg font-semibold">{data?.plans.length ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Active subs</p>
                  <p className="mt-1 text-lg font-semibold">
                    {summary?.activeSubscriptions.length ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Health</h2>
            <span className="rounded-md bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
              Backend
            </span>
          </div>
          <div className="mt-5 space-y-4 text-sm">
            {error ? <ErrorState message={error} /> : null}
            {!data && !error ? <LoadingState label="Loading tenant data..." /> : null}
            {summary ? (
              <>
                <p className="rounded-md bg-slate-50 p-3 font-medium text-slate-700">
                  {summary.enabledUsers} enabled users can access this tenant.
                </p>
                <p className="rounded-md bg-slate-50 p-3 font-medium text-slate-700">
                  {summary.inactivePlans.length} plans are currently disabled.
                </p>
                <p className="rounded-md bg-slate-50 p-3 font-medium text-slate-700">
                  {summary.activeSubscriptions.length} subscriptions are billing-active.
                </p>
              </>
            ) : null}
          </div>
        </aside>
      </section>

      {summary ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              detail="Records returned by /customers"
              label="Customers"
              tone="emerald"
              value={String(data?.customers.length ?? 0)}
            />
            <MetricCard
              detail={`${summary.enabledUsers} enabled`}
              label="Tenant users"
              tone="sky"
              value={String(data?.users.length ?? 0)}
            />
            <MetricCard
              detail={`${summary.inactivePlans.length} disabled`}
              label="Billing plans"
              tone="amber"
              value={String(data?.plans.length ?? 0)}
            />
            <MetricCard
              detail="Sum of active plan amounts"
              label="Active revenue"
              tone="rose"
              value={formatMoney(summary.activeRevenue, summary.currency)}
            />
          </section>

          <section className="grid flex-1 gap-6 py-8 lg:grid-cols-[1fr_22rem]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-lg font-semibold">Subscription board</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest subscriptions returned by the tenant API.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">ID</th>
                      <th className="px-5 py-3 font-semibold">Customer</th>
                      <th className="px-5 py-3 font-semibold">Plan</th>
                      <th className="px-5 py-3 font-semibold">Amount</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.latestSubscriptions.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          #{subscription.id}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {subscription.customerId}
                        </td>
                        <td className="px-5 py-4 font-semibold">{subscription.planName}</td>
                        <td className="px-5 py-4">
                          {formatMoney(subscription.planAmount, subscription.currency)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                            {subscription.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Live activity</h2>
              <div className="mt-5 space-y-4">
                {data?.plans.slice(0, 4).map((plan, index) => (
                  <div className="flex gap-3" key={plan.id}>
                    <div className="mt-1 grid size-7 shrink-0 place-items-center rounded-md bg-slate-950 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-600">
                      {plan.name} is {plan.active ? "available" : "disabled"} at{" "}
                      {formatMoney(plan.amount, plan.currency)} / {plan.billingInterval.toLowerCase()}.
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </>
      ) : null}
    </LaunchOpsShell>
  );
}
