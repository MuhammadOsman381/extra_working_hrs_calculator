import type { ReactNode } from "react";
import { Card } from "@/src/components/ui/card";

export function StatisticsCard({
  title,
  value,
  icon,
  caption,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  caption: string;
}) {
  return (
    <Card
      as="article"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--subtle)]">{title}</p>
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-soft)] via-[var(--surface)] to-[color-mix(in_srgb,var(--accent-2)_14%,transparent)] text-[var(--accent)] shadow-[var(--shadow-card)]">
          {icon}
        </span>
      </div>
      <p className="mt-5 text-2xl font-black text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{caption}</p>
    </Card>
  );
}
