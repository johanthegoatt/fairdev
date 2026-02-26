"use client";

export function StatusChip({ status }: { status: "underpaid" | "fair" | "overpaid" | "queued" | "processing" | "completed" | "failed" }) {
  const colorClass =
    status === "underpaid"
      ? "border border-orange-200 bg-orange-100 text-orange-700"
      : status === "overpaid"
        ? "border border-sky-200 bg-sky-100 text-sky-700"
        : status === "fair" || status === "completed"
          ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
          : status === "failed"
            ? "border border-red-200 bg-red-100 text-red-700"
            : "border border-slate-200 bg-slate-100 text-slate-700";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${colorClass}`}>{status}</span>;
}
