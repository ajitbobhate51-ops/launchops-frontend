"use client";

import { useEffect, useState } from "react";
import { LaunchOpsShell } from "@/components/LaunchOpsShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/PageState";
import { getApiErrorMessage } from "@/services/api";

export type Column<T> = {
  header: string;
  cell: (item: T) => React.ReactNode;
};

export function ResourcePage<T>({
  title,
  description,
  load,
  columns,
  emptyMessage,
  getKey,
}: {
  title: string;
  description: string;
  load: () => Promise<T[]>;
  columns: Column<T>[];
  emptyMessage: string;
  getKey: (item: T) => React.Key;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      setLoading(true);
      setError("");

      try {
        const nextItems = await load();

        if (mounted) {
          setItems(nextItems);
        }
      } catch (err) {
        if (mounted) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      mounted = false;
    };
  }, [load]);

  return (
    <LaunchOpsShell>
      <section className="py-8">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>

          <div className="p-5">
            {loading ? <LoadingState /> : null}
            {error ? <ErrorState message={error} /> : null}
            {!loading && !error && items.length === 0 ? (
              <EmptyState message={emptyMessage} />
            ) : null}
          </div>

          {!loading && !error && items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    {columns.map((column) => (
                      <th className="px-5 py-3 font-semibold" key={column.header}>
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={getKey(item)}>
                      {columns.map((column) => (
                        <td className="px-5 py-4 text-slate-600" key={column.header}>
                          {column.cell(item)}
                        </td>
                      ))}
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

export function StatusPill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "emerald" | "rose" | "amber";
}) {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
