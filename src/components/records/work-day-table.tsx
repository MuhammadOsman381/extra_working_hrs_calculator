"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, TimerReset, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { requestJson } from "@/src/lib/client-api";
import type { WorkDayRecord } from "@/src/features/work-days/types";

function time(value?: string | null) {
  return value ? new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Active";
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(new Date(`${value}T00:00:00`));
}

function RowActions({
  record,
  onEdit,
  onDelete,
  deleting,
}: {
  record: WorkDayRecord;
  onEdit: (record: WorkDayRecord) => void;
  onDelete: (record: WorkDayRecord) => void;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="secondary"
        className="h-11 px-4"
        icon={<Pencil size={24} strokeWidth={1.7} />}
        onClick={() => onEdit(record)}
      >
        Edit
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-11 px-4 text-[var(--danger)] hover:text-[var(--danger)]"
        icon={<Trash2 size={24} strokeWidth={1.7} />}
        disabled={deleting}
        onClick={() => onDelete(record)}
      >
        {deleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}

function DeleteDialog({
  record,
  onCancel,
  onConfirm,
  deleting,
}: {
  record: WorkDayRecord | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}) {
  return (
    <AnimatePresence>
      {record ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-record-title"
        >
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] p-5 shadow-[var(--soft-shadow)]"
          >
            <h2 id="delete-record-title" className="text-lg font-semibold text-[var(--foreground)]">
              Delete record?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              This will permanently remove the work history for {record.date}.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="button" variant="danger" disabled={deleting} onClick={onConfirm}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function WorkDayTable({
  days,
  loading,
  onEdit,
  onAdd,
  onStartWork,
  onDeleted,
}: {
  days: WorkDayRecord[];
  loading: boolean;
  onEdit: (record: WorkDayRecord) => void;
  onAdd: () => void;
  onStartWork: () => void;
  onDeleted: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WorkDayRecord | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(pendingDelete.id);
    await requestJson(`/api/work-days/${pendingDelete.id}`, { method: "DELETE" });
    await onDeleted();
    setDeleting(null);
    setPendingDelete(null);
  }

  if (loading) {
    return <Card className="p-8 text-center text-sm font-medium text-[var(--muted)]" interactive={false}>Loading records...</Card>;
  }

  if (!days.length) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-soft)] via-[var(--surface)] to-[color-mix(in_srgb,var(--accent-2)_14%,transparent)] text-[var(--accent)] shadow-[var(--shadow-card)]">
          <TimerReset size={32} strokeWidth={1.8} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">No work records</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          Start tracking your workday or add a historical record to see your productivity history here.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="accent" onClick={onStartWork}>
            Start Work
          </Button>
          <Button variant="secondary" icon={<Plus size={22} strokeWidth={1.7} />} onClick={onAdd}>
            Add Record
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] shadow-[var(--shadow-card)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-[var(--subtle)]">
            <tr>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Start</th>
              <th className="px-4 py-3 font-bold">End</th>
              <th className="px-4 py-3 font-bold">Break</th>
              <th className="px-4 py-3 font-bold">Working</th>
              <th className="px-4 py-3 font-bold">Extra</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {days.map((day) => (
              <motion.tr
                key={day.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--gradient-start)_12%,var(--surface-elevated))]"
              >
                <td className="px-4 py-4 font-semibold text-[var(--foreground)]">{shortDate(day.date)}</td>
                <td className="px-4 py-4">{time(day.startTime)}</td>
                <td className="px-4 py-4">{time(day.endTime)}</td>
                <td className="px-4 py-4">{day.summary.breakTime}</td>
                <td className="px-4 py-4 font-semibold text-[var(--foreground)]">{day.summary.actualWorking}</td>
                <td className="px-4 py-4 font-semibold text-[var(--accent)]">+{day.summary.extra}</td>
                <td className="px-4 py-4">
                  <RowActions record={day} onEdit={onEdit} onDelete={setPendingDelete} deleting={deleting === day.id} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {days.map((day) => (
          <Card
            as="article"
            key={day.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-[var(--foreground)]">{shortDate(day.date)}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {time(day.startTime)} to {time(day.endTime)}
                </p>
              </div>
              <RowActions record={day} onEdit={onEdit} onDelete={setPendingDelete} deleting={deleting === day.id} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase text-[var(--subtle)]">Break</p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">{day.summary.breakTime}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--subtle)]">Working</p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">{day.summary.actualWorking}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--subtle)]">Extra</p>
                <p className="mt-1 font-semibold text-[var(--accent)]">+{day.summary.extra}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <DeleteDialog
        record={pendingDelete}
        deleting={deleting !== null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
