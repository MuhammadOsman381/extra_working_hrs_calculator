"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

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
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--subtle)]">{title}</p>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{caption}</p>
    </motion.article>
  );
}
