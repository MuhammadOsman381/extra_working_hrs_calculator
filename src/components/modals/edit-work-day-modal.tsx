"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WorkDayForm } from "@/src/components/forms/work-day-form";
import type { WorkDayRecord } from "@/src/features/work-days/types";

export function EditWorkDayModal({
  record,
  normalWorkingHours,
  onClose,
  onSaved,
}: {
  record: WorkDayRecord | null;
  normalWorkingHours: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  return (
    <AnimatePresence>
      {record ? (
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center bg-zinc-950/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-3xl">
            <WorkDayForm key={record.id} record={record} normalWorkingHours={normalWorkingHours} onCancel={onClose} onSaved={onSaved} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
