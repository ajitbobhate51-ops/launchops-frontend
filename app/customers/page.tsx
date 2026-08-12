"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LaunchOpsShell } from "@/components/LaunchOpsShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/PageState";
import { api, getApiErrorMessage } from "@/services/api";
import { Customer, listCustomers } from "@/services/launchops";

type CustomerFormState = {
  id: number | null;
  name: string;
};

const initialFormState: CustomerFormState = {
  id: null,
  name: "",
};

function createCustomer(name: string) {
  return api.post<Customer>("/customers", { name });
}

function updateCustomer(id: number, name: string) {
  return api.put<Customer>(`/customers/${id}`, { name });
}

function deleteCustomer(id: number) {
  return api.delete<void>(`/customers/${id}`);
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CustomerFormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listCustomers();
      setCustomers(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name) {
      setError("Customer name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (form.id === null) {
        await createCustomer(name);
      } else {
        await updateCustomer(form.id, name);
      }

      setForm(initialFormState);
      await loadCustomers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(`Delete ${customer.name}?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(customer.id);
    setError("");

    try {
      await deleteCustomer(customer.id);
      await loadCustomers();

      if (form.id === customer.id) {
        setForm(initialFormState);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  const editing = form.id !== null;

  return (
    <LaunchOpsShell>
      <section className="grid gap-6 py-8 lg:grid-cols-[22rem_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            {editing ? "Edit Customer" : "Add Customer"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Customer records are saved directly to the tenant API.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Name</span>
              <input
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Customer name"
                type="text"
                value={form.name}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={saving}
                type="submit"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Customer"}
              </button>
              {editing ? (
                <button
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={saving}
                  onClick={() => setForm(initialFormState)}
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </aside>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Customers</h2>
              <p className="mt-1 text-sm text-slate-500">
                Tenant-scoped records returned by /customers.
              </p>
              </div>
            <button
              className="w-fit rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={loading || saving || deletingId !== null}
              onClick={loadCustomers}
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="p-5">
            {loading ? <LoadingState label="Loading customers..." /> : null}
            {error ? <ErrorState message={error} /> : null}
            {!loading && !error && customers.length === 0 ? (
              <EmptyState message="No customers were returned for this tenant." />
            ) : null}
          </div>

          {!loading && customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        #{customer.id}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{customer.name}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                            disabled={saving || deletingId !== null}
                            onClick={() =>
                              setForm({ id: customer.id, name: customer.name })
                            }
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
                            disabled={saving || deletingId !== null}
                            onClick={() => handleDelete(customer)}
                            type="button"
                          >
                            {deletingId === customer.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
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
