"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";

function monthTitle(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex - 1, 1),
  );
}

function shiftMonth(month: string, amount: number) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthSelector({
  month,
  onChange,
}: {
  month: string;
  onChange: (month: string) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
      <Button type="button" variant="ghost" className="h-9 w-9 px-0" onClick={() => onChange(shiftMonth(month, -1))} aria-label="Previous month">
        <ChevronLeft size={16} />
      </Button>
      <label className="relative grid h-9 min-w-44 place-items-center rounded-md px-3 text-sm font-semibold text-[var(--foreground)]">
        <span>{monthTitle(month)}</span>
        <input
          className="absolute inset-0 cursor-pointer opacity-0"
          type="month"
          value={month}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Select month"
        />
      </label>
      <Button type="button" variant="ghost" className="h-9 w-9 px-0" onClick={() => onChange(shiftMonth(month, 1))} aria-label="Next month">
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
