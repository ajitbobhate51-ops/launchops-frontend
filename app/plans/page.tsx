"use client";

import { ResourcePage, StatusPill } from "@/components/ResourcePage";
import { BillingPlan, listPlans } from "@/services/launchops";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export default function PlansPage() {
  return (
    <ResourcePage<BillingPlan>
      columns={[
        {
          header: "Code",
          cell: (plan) => (
            <span className="font-semibold text-slate-950">{plan.code}</span>
          ),
        },
        {
          header: "Name",
          cell: (plan) => plan.name,
        },
        {
          header: "Amount",
          cell: (plan) => formatMoney(plan.amount, plan.currency),
        },
        {
          header: "Interval",
          cell: (plan) => <StatusPill>{plan.billingInterval}</StatusPill>,
        },
        {
          header: "Status",
          cell: (plan) => (
            <StatusPill tone={plan.active ? "emerald" : "rose"}>
              {plan.active ? "Active" : "Disabled"}
            </StatusPill>
          ),
        },
      ]}
      description="Billing plans from /api/plans."
      emptyMessage="No billing plans were returned."
      getKey={(plan) => plan.id}
      load={async () => (await listPlans()).data}
      title="Billing Plans"
    />
  );
}
