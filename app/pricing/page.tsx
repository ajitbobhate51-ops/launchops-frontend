"use client";

import { ResourcePage, StatusPill } from "@/components/ResourcePage";
import { Pricing, getPricing, listSubscriptions } from "@/services/launchops";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

async function loadPricingRows() {
  const subscriptions = (await listSubscriptions()).data;
  const pricingResponses = await Promise.all(
    subscriptions.map((subscription) => getPricing(subscription.id)),
  );

  return pricingResponses.map((response) => response.data);
}

export default function PricingPage() {
  return (
    <ResourcePage<Pricing>
      columns={[
        {
          header: "Subscription",
          cell: (pricing) => (
            <span className="font-semibold text-slate-950">
              #{pricing.subscriptionId}
            </span>
          ),
        },
        {
          header: "Customer",
          cell: (pricing) => `#${pricing.customerId}`,
        },
        {
          header: "Plan",
          cell: (pricing) => pricing.planName,
        },
        {
          header: "Subtotal",
          cell: (pricing) => formatMoney(pricing.subtotal, pricing.currency),
        },
        {
          header: "Tax",
          cell: (pricing) => formatMoney(pricing.tax, pricing.currency),
        },
        {
          header: "Final Amount",
          cell: (pricing) => (
            <span className="font-semibold text-slate-950">
              {formatMoney(pricing.finalAmount, pricing.currency)}
            </span>
          ),
        },
        {
          header: "Status",
          cell: (pricing) => (
            <StatusPill
              tone={pricing.subscriptionStatus === "ACTIVE" ? "emerald" : "rose"}
            >
              {pricing.subscriptionStatus}
            </StatusPill>
          ),
        },
      ]}
      description="Calculated pricing from /api/pricing/{subscriptionId}."
      emptyMessage="No subscriptions were available for pricing calculations."
      getKey={(pricing) => pricing.subscriptionId}
      load={loadPricingRows}
      title="Pricing"
    />
  );
}
