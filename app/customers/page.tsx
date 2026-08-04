"use client";

import { ResourcePage } from "@/components/ResourcePage";
import { Customer, listCustomers } from "@/services/launchops";

export default function CustomersPage() {
  return (
    <ResourcePage<Customer>
      columns={[
        {
          header: "ID",
          cell: (customer) => (
            <span className="font-semibold text-slate-950">#{customer.id}</span>
          ),
        },
        {
          header: "Name",
          cell: (customer) => customer.name,
        },
      ]}
      description="Customers returned by the tenant-scoped /customers endpoint."
      emptyMessage="No customers were returned for this tenant."
      getKey={(customer) => customer.id}
      load={async () => (await listCustomers()).data}
      title="Customers"
    />
  );
}
