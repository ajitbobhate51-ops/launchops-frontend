export function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-800">
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
      {message}
    </div>
  );
}
