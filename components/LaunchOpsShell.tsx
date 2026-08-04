"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSession, logout, type AuthSession } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/users", label: "Users" },
  { href: "/plans", label: "Plans" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/pricing", label: "Pricing" },
];

export function LaunchOpsShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const nextSession = getSession();

    if (!nextSession) {
      router.replace("/login");
      return;
    }

    setSession(nextSession);
    setCheckingAuth(false);
  }, [router]);

  const currentSection = useMemo(
    () => navItems.find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard",
    [pathname],
  );

  if (checkingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8fb] text-slate-950">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-semibold shadow-sm">
          Checking session...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white">
              LO
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                LaunchOps
              </p>
              <h1 className="text-2xl font-semibold text-slate-950">
                {currentSection}
              </h1>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  className={`rounded-md px-3 py-2 transition ${
                    active
                      ? "bg-white text-slate-950 shadow-sm"
                      : "hover:bg-white hover:text-slate-950"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              className="rounded-md bg-slate-950 px-4 py-2 text-white shadow-sm transition hover:bg-slate-800"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </nav>
        </header>

        {session ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1">
              Tenant: {session.tenantId}
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1">
              Role: {session.role}
            </span>
          </div>
        ) : null}

        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}
