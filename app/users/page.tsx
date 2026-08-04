"use client";

import { ResourcePage, StatusPill } from "@/components/ResourcePage";
import { TenantUser, listTenantUsers } from "@/services/launchops";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function UsersPage() {
  return (
    <ResourcePage<TenantUser>
      columns={[
        {
          header: "ID",
          cell: (user) => (
            <span className="font-semibold text-slate-950">#{user.id}</span>
          ),
        },
        {
          header: "Email",
          cell: (user) => user.email,
        },
        {
          header: "Role",
          cell: (user) => <StatusPill>{user.role}</StatusPill>,
        },
        {
          header: "Status",
          cell: (user) => (
            <StatusPill tone={user.enabled ? "emerald" : "rose"}>
              {user.enabled ? "Enabled" : "Disabled"}
            </StatusPill>
          ),
        },
        {
          header: "Created",
          cell: (user) => formatDate(user.createdAt),
        },
      ]}
      description="Tenant users from /api/tenant/users."
      emptyMessage="No tenant users were returned."
      getKey={(user) => user.id}
      load={async () => (await listTenantUsers()).data}
      title="Tenant Users"
    />
  );
}
