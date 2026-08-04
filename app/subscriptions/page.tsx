"use client";

import { ResourcePage, StatusPill } from "@/components/ResourcePage";
import { Subscription, listSubscriptions } from "@/services/launchops";

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
  return (
    <ResourcePage<Subscription>
      columns={[
        {
          header: "ID",
          cell: (subscription) => (
            <span className="font-semibold text-slate-950">#{subscription.id}</span>
          ),
        },
        {
          header: "Customer",
          cell: (subscription) => `#${subscription.customerId}`,
        },
        {
          header: "Plan",
          cell: (subscription) => subscription.planName,
        },
        {
          header: "Amount",
          cell: (subscription) =>
            formatMoney(subscription.planAmount, subscription.currency),
        },
        {
          header: "Status",
          cell: (subscription) => (
            <StatusPill tone={subscription.status === "ACTIVE" ? "emerald" : "rose"}>
              {subscription.status}
            </StatusPill>
          ),
        },
        {
          header: "Cancelled",
          cell: (subscription) => formatDate(subscription.cancelledAt),
        },
      ]}
      description="Subscriptions from /api/subscriptions."
      emptyMessage="No subscriptions were returned."
      getKey={(subscription) => subscription.id}
      load={async () => (await listSubscriptions()).data}
      title="Subscriptions"
    />
  );
}
