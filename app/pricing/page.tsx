"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LaunchOpsShell } from "@/components/LaunchOpsShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/PageState";
import { StatusPill } from "@/components/ResourcePage";
import { getApiErrorMessage } from "@/services/api";
import { Pricing, getPricing, listSubscriptions } from "@/services/launchops";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export default function PricingPage() {
  const [pricingRows, setPricingRows] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPricing = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const subscriptions = (await listSubscriptions()).data;
      const responses = await Promise.all(
        subscriptions.map((subscription) => getPricing(subscription.id)),
      );
      setPricingRows(responses.map((response) => response.data));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const summary = useMemo(() => {
    const currency = pricingRows[0]?.currency ?? "USD";
    const subtotal = pricingRows.reduce(
      (total, pricing) => total + Number(pricing.subtotal),
      0,
    );
    const discount = pricingRows.reduce(
      (total, pricing) => total + Number(pricing.discount),
      0,
    );
    const tax = pricingRows.reduce(
      (total, pricing) => total + Number(pricing.tax),
      0,
    );
    const finalAmount = pricingRows.reduce(
      (total, pricing) => total + Number(pricing.finalAmount),
      0,
    );

    return { currency, subtotal, discount, tax, finalAmount };
  }, [pricingRows]);

  return (
    <LaunchOpsShell>
      <section className="py-8">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Pricing</h2>
              <p className="mt-1 text-sm text-slate-500">
                Calculated subscription pricing from /api/pricing/{"{id}"}.
              </p>
            </div>
            <button
              className="w-fit rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={loading}
              onClick={loadPricing}
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="p-5">
            {loading ? <LoadingState label="Calculating pricing..." /> : null}
            {error ? <ErrorState message={error} /> : null}
            {!loading && !error && pricingRows.length === 0 ? (
              <EmptyState message="No subscriptions were available for pricing calculations." />
            ) : null}

            {!loading && !error && pricingRows.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Subtotal</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {formatMoney(summary.subtotal, summary.currency)}
                  </p>
                </article>
                <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Discount</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {formatMoney(summary.discount, summary.currency)}
                  </p>
                </article>
                <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Tax</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {formatMoney(summary.tax, summary.currency)}
                  </p>
                </article>
                <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-700">
                    Final Amount
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-emerald-950">
                    {formatMoney(summary.finalAmount, summary.currency)}
                  </p>
                </article>
              </div>
            ) : null}
          </div>

          {!loading && !error && pricingRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Subscription</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Subtotal</th>
                    <th className="px-5 py-3 font-semibold">Discount</th>
                    <th className="px-5 py-3 font-semibold">Tax</th>
                    <th className="px-5 py-3 font-semibold">Final</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pricingRows.map((pricing) => (
                    <tr key={pricing.subscriptionId}>
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        #{pricing.subscriptionId}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        #{pricing.customerId}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {pricing.planName}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatMoney(pricing.subtotal, pricing.currency)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatMoney(pricing.discount, pricing.currency)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatMoney(pricing.tax, pricing.currency)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        {formatMoney(pricing.finalAmount, pricing.currency)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill
                          tone={
                            pricing.subscriptionStatus === "ACTIVE"
                              ? "emerald"
                              : "rose"
                          }
                        >
                          {pricing.subscriptionStatus}
                        </StatusPill>
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
