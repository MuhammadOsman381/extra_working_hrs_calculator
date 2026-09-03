"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Pencil, Plus, TimerReset, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { requestJson } from "@/src/lib/client-api";
import type { WorkDayRecord } from "@/src/features/work-days/types";

function time(value?: string | null) {
  return value ? new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Active";
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(new Date(`${value}T00:00:00`));
}

function RowMenu({
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
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-end">
      <Button
        className="h-9 w-9 px-0"
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open record actions"
      >
        <MoreHorizontal size={16} />
      </Button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-1 shadow-[var(--shadow)]"
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              onClick={() => {
                setOpen(false);
                onEdit(record);
              }}
            >
              <Pencil size={15} />
              Edit record
            </button>
            <button
              type="button"
              disabled={deleting}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-[var(--danger)] hover:bg-[var(--surface-muted)] disabled:opacity-50"
              onClick={() => {
                setOpen(false);
                onDelete(record);
              }}
            >
              <Trash2 size={15} />
              Delete record
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
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
            className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
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
    return <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm font-medium text-[var(--muted)]">Loading records...</div>;
  }

  if (!days.length) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          <TimerReset size={24} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">No work records</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          Start tracking your workday or add a historical record to see your productivity history here.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="accent" onClick={onStartWork}>
            Start Work
          </Button>
          <Button variant="secondary" icon={<Plus size={16} />} onClick={onAdd}>
            Add Record
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-visible rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
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
                className="text-[var(--muted)] transition hover:bg-[var(--surface-elevated)]"
              >
                <td className="px-4 py-4 font-semibold text-[var(--foreground)]">{shortDate(day.date)}</td>
                <td className="px-4 py-4">{time(day.startTime)}</td>
                <td className="px-4 py-4">{time(day.endTime)}</td>
                <td className="px-4 py-4">{day.summary.breakTime}</td>
                <td className="px-4 py-4 font-semibold text-[var(--foreground)]">{day.summary.actualWorking}</td>
                <td className="px-4 py-4 font-semibold text-[var(--accent)]">+{day.summary.extra}</td>
                <td className="px-4 py-4">
                  <RowMenu record={day} onEdit={onEdit} onDelete={setPendingDelete} deleting={deleting === day.id} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {days.map((day) => (
          <motion.article
            key={day.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-[var(--foreground)]">{shortDate(day.date)}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {time(day.startTime)} to {time(day.endTime)}
                </p>
              </div>
              <RowMenu record={day} onEdit={onEdit} onDelete={setPendingDelete} deleting={deleting === day.id} />
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
          </motion.article>
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
